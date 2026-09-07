// Exercise the sales conversation, mobile disclosure navigation and deck entry/return paths.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';
(async () => {
 const browser = await chromium.launch({headless:true});
 let checks = 0;
 try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320,390,768,1024,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   for (const path of ['/', '/briefings/', '/discovery/', '/dictionary/', '/releases/', '/docs/industry/architecture/']) {
    await page.goto(base + path);
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path}/${width}: horizontal overflow`);
    if (width < 800) {
     assert.ok(await page.locator('#conversation-nav').isHidden());
     await page.locator('#conversation-menu').click();
     assert.equal(await page.locator('#conversation-menu').getAttribute('aria-expanded'),'true');
     assert.ok(await page.locator('#conversation-nav').isVisible());
     await page.keyboard.press('Escape');
     assert.ok(await page.locator('#conversation-nav').isHidden());
     assert.equal(await page.evaluate(()=>document.activeElement.id),'conversation-menu');
    } else {
     assert.ok(await page.locator('#conversation-menu').isHidden());
     assert.ok(await page.locator('#conversation-nav').isVisible());
    }
    assert.equal(await page.locator('#conversation-nav [aria-current="page"]').count(),1, `${path}: unambiguous active location`);
    checks++;
   }
  }
  await page.goto(base + '/docs/industry/architecture/');
  assert.ok(await page.locator('details.sales-nav-group').first().getAttribute('open') !== null);
  await page.goto(base + '/briefings/?for=technical');
  assert.equal(await page.locator('.room-card:visible').count(),2);
  assert.equal(await page.locator('.room-card:visible[data-deck-audience="technical"]').count(),2);
  await page.locator('[data-room-filter="evp"]').click();
  assert.equal(new URL(page.url()).searchParams.get('for'),'evp');
  await page.reload();
  assert.equal(await page.locator('.room-card:visible[data-deck-audience="evp"]').count(),2);
  await page.locator('[data-room-filter="all"]').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.room-card:visible').count(),4);
  for (let index=0;index<4;index++) {
   const card=page.locator('.room-card').nth(index);
   await card.locator('summary').click();
   assert.ok(await card.locator('details ul').isVisible());
   const url=await card.locator('.room-actions .btn').getAttribute('href');
   const pdf=await card.locator('.room-actions a').last().getAttribute('href');
   assert.equal((await page.request.get(new URL(pdf,base).href)).status(),200);
   await page.goto(new URL(url,base).href);
   assert.equal(await page.locator('.slide:not([hidden])').count(),1);
   await page.locator('.deck-brand').click();
   assert.equal(new URL(page.url()).pathname,'/ai_qe/briefings/');
  }
  await page.setViewportSize({width:390,height:844});
  await page.route('**/assets/js/search-data.json', async route => { const response = await route.fetch(); await new Promise(resolve=>setTimeout(resolve,500)); await route.fulfill({response}); });
  await page.goto(base + '/');
  await page.locator('#search-input').fill('payment');
  await page.locator('.search-result').first().waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelectorAll('.search-result').length>10);
  await page.locator('#search-input').fill('');
  await page.locator('#search-input').pressSequentially('payment');
  await page.waitForFunction(()=>document.querySelectorAll('.search-result').length>10);
  await page.locator('[data-close-search]').click();
  assert.equal(await page.locator('#search-input').inputValue(),'');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'conversation-menu');
  await page.locator('#search-input').fill('architecture');
  await page.locator('[data-close-search]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#search-input').inputValue(),'');
  await page.locator('#conversation-menu').click();
  await page.setViewportSize({width:1440,height:1000});
  assert.ok(await page.locator('#conversation-nav').isVisible());
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.locator('#conversation-nav').isHidden());
  assert.deepEqual(errors,[]);
  const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.goto(base + '/briefings/');
  assert.ok(await nojs.locator('#conversation-nav').isVisible());
  assert.equal(await nojs.locator('.room-card:visible').count(),4);
  await nojs.locator('.sales-nav-group summary').first().click();
  assert.ok(await nojs.locator('.sales-nav-children').first().isVisible());
  console.log(`Passed: ${checks} page/viewport checks; mobile menu, focus, active location, search, audience sharing, all four deck/PDF paths, return navigation and no-JS access`);
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
