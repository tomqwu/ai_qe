// Real browser checks for failure modes found in the September 2026 design audit.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage(); const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 let checked = 0;
 try {
  for (const viewport of [{width:1280,height:720},{width:1920,height:1080},{width:375,height:812}]) {
   await page.setViewportSize(viewport);
   for (const [audience,count] of [['evp',21],['technical',29]]) {
    await page.goto(`${base}/briefings/${audience}/`); await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.slide').count(),count);
    for (let i=0;i<count;i++) {
     await page.locator('.slide-picker-label select').selectOption(String(i));
     const metrics=await page.locator(`#slide-${i+1}`).evaluate(s => {
      const c=s.querySelector('.slide-content'), n=document.querySelector('.deck-navigation').getBoundingClientRect();
      return {slideBottom:s.getBoundingClientRect().bottom, navTop:n.top, navBottom:n.bottom, h:innerHeight, overflow:c?c.scrollHeight-c.clientHeight:0, wide:document.documentElement.scrollWidth>innerWidth, visible:document.querySelectorAll('.slide:not([hidden])').length};
     });
     assert.equal(metrics.visible,1);assert.ok(!metrics.wide,`${audience}/${i+1}: horizontal page overflow`);
     assert.ok(metrics.navTop>=0 && metrics.navBottom<=metrics.h+1, 'Navigation outside viewport');
     if(viewport.width>700) {assert.ok(metrics.slideBottom<=metrics.navTop+1,`${audience}/${i+1}: slide behind navigation`);assert.ok(metrics.overflow<=3,`${audience}/${i+1} at ${viewport.width}: ${metrics.overflow}px content overflow`);}
     if(viewport.width===1280) {
      const overflowLabels=await page.locator(`#slide-${i+1}`).evaluate(s=>[...s.querySelectorAll('.diagram-node')].flatMap(node=>{
       const r=node.querySelector('rect').getBBox();return [...node.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x+b.width>r.x+r.width-3 || b.y+b.height>r.y+r.height-2;}).map(t=>t.textContent);
      }));
      assert.deepEqual(overflowLabels,[],`${audience}/${i+1}: labels exceed node boundaries`);
     }
     checked++;
    }
   }
  }
  await page.setViewportSize({width:1280,height:720});
  await page.goto(`${base}/briefings/technical/#slide-14`);
  await page.locator('[data-reading]').click();
  await page.locator('[data-fullscreen]').click();
  assert.equal(await page.locator('.slide:not([hidden])').count(),1,'Read all → Present must show one slide');
  assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'),'slide-14');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'),'slide-14');
  await page.locator('[data-notes]').click();assert.ok(await page.locator('dialog').isVisible());
  await page.keyboard.press('Escape');assert.ok(!await page.locator('dialog').isVisible());
  assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-notes')),true,'Notes close returns focus');
  await page.locator('[data-next]').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'),'slide-15');
  // Only the selected semantic path moves. AppSec alternatives are never played together.
  await page.goto(`${base}/briefings/technical/#slide-29`); await page.locator('#slide-29').waitFor({state:'visible'});
  await page.locator('[data-diagram-tools]').click();
  await page.locator('[data-tour-branch]').selectOption('dismiss');
  for(let i=0;i<2;i++)await page.locator('.deck-diagram-panel [data-tour-next]').click();
  assert.deepEqual(await page.locator('#slide-29 path.edge.route-focus').evaluateAll(paths=>paths.map(p=>`${p.dataset.from}:${p.dataset.to}`)),['edge:3']);
  await page.keyboard.press('Escape');
  // Reduced motion retains a usable stepper.
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`${base}/briefings/technical/#slide-2`);await page.locator('#slide-2').waitFor({state:'visible'});await page.locator('[data-diagram-tools]').click();
  assert.ok(await page.locator('.deck-diagram-panel [data-tour-play]').isDisabled());
  await page.locator('.deck-diagram-panel [data-tour-next]').click();
  assert.equal(await page.locator('#slide-2').getAttribute('hidden'),null);
  assert.ok((await page.locator('#slide-2 path.route-focus').count())>0);
  // Embedded state is reflected in both the standalone link and reloadable URL.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(`${base}/?audience=technical&slide=slide-10#briefings`);
  await page.locator('#briefing-frame').scrollIntoViewIfNeeded();
  const frame=page.frameLocator('#briefing-frame');
  await frame.locator('[data-next]').click();
  await page.waitForFunction(()=>document.querySelector('[data-deck-link]').hash==='#slide-11');
  assert.equal(new URL(page.url()).searchParams.get('slide'),'slide-11');
  await page.reload();await frame.locator('#slide-11').waitFor({state:'visible'});
  // The published arithmetic and searchable anchors must match the interactive state.
  const search=await (await page.request.get(`${base}/assets/js/search-data.json`)).json();
  assert.equal(Object.values(search).filter(s=>/\/briefings\/(evp|technical)\/#slide-/.test(s.url)).length,50);
  await page.goto(`${base}/briefings/evp/#slide-5`);await page.locator('[data-preset="slowdown"]').click();
  assert.match(await page.locator('[data-net]').innerText(),/450/);
  assert.match(await page.locator('[data-model-note]').innerText(),/Cash impact.*120/);
  assert.deepEqual(errors,[]);
  console.log(`Passed: ${checked} slide/viewport checks, modes, keyboard/focus, notes, motion branches, reduced motion, embedded sharing and searchable slide anchors`);
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
