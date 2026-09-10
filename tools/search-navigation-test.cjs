// Use real pointer/key events: dispatching anchor.click() bypasses Safari's blur bug.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';

(async () => {
 let navigations = 0;
 for (const engine of [webkit, chromium]) {
  // Full Chromium preserves native new-tab lifecycle events. Headless Shell
  // can miss the initial commit under load and report a loaded tab as blank.
  const browser = await engine.launch({headless:true, ...(engine === chromium ? {channel:'chromium'} : {})});
  try {
   for (const mode of ['desktop', 'narrow', 'touch']) {
    const page = await browser.newPage({viewport:{width:mode==='desktop'?1440:390,height:900},
     hasTouch:mode==='touch',isMobile:mode==='touch'});
    page.setDefaultTimeout(10000);
    const errors = [], requests = [];
    page.on('request', request => { if (request.url().includes('/assets/data/narration')) { requests.push({url:request.url(),from:request.frame().url()}); if (requests.length>8) requests.shift(); } });
    page.on('pageerror', error => errors.push({message:error.message,stack:error.stack,page:page.url(),requests:[...requests]}));
    const search = async (query='payment') => {
     await page.goto(base + '/');
     const src = await page.locator('script[src*="/just-the-docs.js"]').getAttribute('src');
     assert.match(src, /\?v=\d+\.\d+\.\d+$/, 'Search script must be versioned for returning readers');
     await page.locator('#search-input').fill(query);
     await page.locator('.search-result').first().waitFor({state:'visible'});
    };
    const follow = async (result, target, method='click') => {
     const expected = new URL(await result.getAttribute('href'),base).href;
     if (method==='enter') await target.press('Enter');
     else await target[method]();
     await page.waitForURL(expected,{timeout:5000});
     await page.waitForLoadState('domcontentloaded');
     assert.ok(await page.locator('body').isVisible());
     if (new URL(expected).hash) {
      const anchor = page.locator(new URL(expected).hash);
      await anchor.waitFor({state:'visible'});
      if (expected.includes('/briefings/')) assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'),new URL(expected).hash.slice(1));
     }
     navigations++;
    };
    // Titles, nested highlight spans, preview text and SVG icons are all link hit areas.
    for (const selector of ['.search-result-title', '.search-result-highlight', '.search-result-preview span', '.search-result-icon']) {
     await search();
     const result = page.locator(`.search-result:has(${selector})`).first();
     await follow(result,result.locator(selector).first(),mode==='touch'?'tap':'click');
    }
    // Search must open the actual term/slide, not just its parent page.
    for (const [query,href] of [['action gateway','/dictionary/#action-gateway'],['architecture','/briefings/technical/#slide-']]) {
     await search(query);
     const result = page.locator(`.search-result[href*="${href}"]`).first();
     await result.waitFor({state:'visible'});
     await follow(result,result.locator('.search-result-title'),mode==='touch'?'tap':'click');
    }
    if (mode==='desktop') {
     // Enter defaults to the first result; arrows can select a different result.
     for (const arrows of [0,2]) {
      await search();
      const result = page.locator('.search-result').nth(arrows?arrows-1:0);
      const expected = new URL(await result.getAttribute('href'),base).href;
      for (let i=0;i<arrows;i++) await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForURL(expected,{timeout:5000});
      navigations++;
     }
     // Tab moves focus to a real link and Enter activates it.
     await search();
     // Safari on macOS uses Option-Tab for links unless full keyboard access is enabled.
     await page.keyboard.press(engine.name()==='webkit' && process.platform==='darwin'?'Alt+Tab':'Tab');
     assert.equal(await page.evaluate(()=>document.activeElement.matches('.search-result')),true);
     await follow(page.locator('.search-result:focus'),page.locator('.search-result:focus'), 'enter');
    }
    await search();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#search-input').inputValue(),'');
    assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('search-active')),false);
    if (mode!=='desktop') {
     await search();
     await page.locator('[data-close-search]')[mode==='touch'?'tap':'click']();
     assert.equal(await page.locator('#search-input').inputValue(),'');
    }
    if (mode==='desktop') {
     // Modifier-opened tabs belong to the context; they need not be page popups.
     {
      await search();
      const result = page.locator('.search-result').first();
      const expected = new URL(await result.getAttribute('href'),base).href;
      const popupPromise = page.context().waitForEvent('page');
      await result.locator('.search-result-title').click({modifiers:['ControlOrMeta']});
      const popup = await popupPromise;
      await popup.bringToFront();
      await popup.waitForURL(expected,{waitUntil:'domcontentloaded',timeout:10000}).catch(error=>{
       throw new Error(`${engine.name()} new tab: expected ${expected}, got ${popup.url()}; ${error.message}`);
      });
      await popup.close();
      navigations++;
     }
     await search();
     await page.locator('.search-overlay').click({position:{x:1300,y:750}});
     assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('search-active')),false);
     await search();
     await page.locator('.header-present').focus();
     assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('search-active')),false);
    }
    assert.deepEqual(errors,[],`${engine.name()}/${mode}: page errors`);
    console.log(`Passed: ${engine.name()}/${mode} result selection and dismissal`);
    await page.close();
   }
  } finally { await browser.close(); }
 }
 console.log(`Passed: ${navigations} real search navigations in Chromium/WebKit; desktop, narrow and touch; pages, terms, slides, keyboard, new tabs and dismissal`);
})().catch(error=>{console.error(error);process.exitCode=1;});
