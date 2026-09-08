const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const data=require('../_data/fintech_case.json'),decks=require('../_data/fintech_decks.json'),{capacity}=require('../assets/js/fintech-model.js');
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
(async()=>{const browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
try {
 for(const viewport of [{width:1280,height:720},{width:1920,height:1080},{width:375,height:812}]) {
  await page.setViewportSize(viewport);
  for(const [audience,slides] of Object.entries(decks)) {
   await page.goto(`${base}/briefings/fintech-${audience}/`);await page.evaluate(()=>document.fonts.ready);
   await page.locator('[data-narration-play]').waitFor({state:'visible'});
   assert.equal(await page.locator('.slide').count(),slides.length);
   for(let i=0;i<slides.length;i++) {
    await page.locator('.deck-navigation select').selectOption(String(i));
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const r=await page.locator('.slide:not([hidden])').evaluate(s=>{const c=s.querySelector('.slide-content'),n=document.querySelector('.deck-navigation').getBoundingClientRect();return {overflow:c.scrollHeight-c.clientHeight,wide:document.documentElement.scrollWidth>innerWidth,slideBottom:s.getBoundingClientRect().bottom,navTop:n.top,navBottom:n.bottom,h:innerHeight};});
    assert.ok(!r.wide,`${audience}/${i+1} horizontal overflow`);assert.ok(r.navBottom<=r.h+1);
    if(viewport.width>700){assert.ok(r.overflow<=3,`${audience}/${i+1}: ${r.overflow}px overflow`);assert.ok(r.slideBottom<=r.navTop+1,`${audience}/${i+1} covered by navigation`);}
    checks++;
   }
  }
 }
 await page.setViewportSize({width:1280,height:800});
 await page.goto(`${base}/briefings/fintech-technical/#slide-3`);
 const packet=page.locator('#slide-3 .flow-effect.route-focus .flow-packet').first();await packet.waitFor({state:'visible'});
 const before=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));await page.waitForTimeout(200);
 const after=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>1,'Platform packet really moves');
 await page.locator('.deck-flow-bar [data-flow-play]').click();
 const paused=await page.locator('#slide-3 svg').evaluate(s=>s.getCurrentTime());await page.waitForTimeout(150);assert.ok(Math.abs(await page.locator('#slide-3 svg').evaluate(s=>s.getCurrentTime())-paused)<.03);
 await page.locator('[data-notes]').click();assert.ok(await page.locator('.deck-drawer .ft-speaker-notes').isVisible());assert.match(await page.locator('[data-drawer-content]').textContent(),/proposed integration work|integration work to build|context connectors/);await page.keyboard.press('Escape');
 await page.goto(`${base}/case-studies/fintech/`);await page.evaluate(()=>document.fonts.ready);
 for(const profile of data.profiles) {
  await page.locator('[data-profile]').selectOption(profile.id);
  for(const capture of [0,50,100]) {
   await page.locator('[data-capture]').fill(String(capture));const r=capacity(data,profile.id,capture);
   assert.equal(await page.locator('[data-total-assisted]').textContent(),String(r.after));
   assert.match(await page.locator('[data-model-output]').textContent(),r.packs===null?/cannot be recovered/:new RegExp(`${r.packs} comparable packs`));
   const ratio=await page.locator('[data-chart-work]').evaluate(el=>el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width);
   assert.ok(Math.abs(ratio-r.work/Math.max(r.baseline,r.after))<.005);
  }
 }
 await page.locator('[data-capture]').fill('101');assert.equal(await page.locator('[data-capture]').getAttribute('aria-invalid'),'true');
 await page.locator('[data-capture]').fill('');assert.match(await page.locator('[data-model-output]').textContent(),/Enter a capacity percentage/);
 await page.locator('[data-capture]').fill('50');assert.equal(await page.locator('[data-capture]').getAttribute('aria-invalid'),null);
 for(const stage of data.workflow){await page.locator(`[data-stage="${stage.id}"]`).click();assert.equal(await page.locator('[data-workflow-stage]:visible').count(),1);assert.ok(await page.locator(`#workflow-${stage.id}`).isVisible());}
 await page.reload();assert.ok(await page.locator('#workflow-reporting').isVisible());
 for(const scenario of ['normal','retry','callback'])for(const bug of [false,true]){
  await page.locator('[data-payment-scenario]').selectOption(scenario);await page.locator('[data-payment-bug]').setChecked(bug);await page.locator('[data-sim-reset]').click();
  for(let i=0;i<5;i++)await page.locator('[data-sim-next]').click();
  assert.match(await page.locator('[data-sim-result] strong').textContent(),scenario!=='normal'&&bug?/blocked/:/passed/);
  assert.ok(await page.locator('[data-sim-next]').isDisabled());
 }
 await page.locator('[data-sim-play]').click();assert.equal(await page.locator('[data-sim-play]').getAttribute('aria-pressed'),'true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-sim-play]').disabled);assert.equal(await page.locator('[data-sim-play]').getAttribute('aria-pressed'),'false');
 await page.locator('[data-sim-next]').click();assert.match(await page.locator('[data-sim-stage]').textContent(),/Step 2/);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${base}/case-studies/fintech/?audience=technical&slide=slide-3#briefings`);await page.locator('#briefing-frame').scrollIntoViewIfNeeded();
 const frame=page.frameLocator('#briefing-frame');await frame.locator('#slide-3').waitFor({state:'visible'});await frame.locator('[data-next]').click();
 await page.waitForFunction(()=>document.querySelector('[data-deck-link]').hash==='#slide-4');assert.match(await page.locator('[data-deck-link]').getAttribute('href'),/fintech-technical/);
 await page.locator('#tab-evp').click();await frame.locator('#slide-1').waitFor({state:'visible'});assert.match(await page.locator('iframe').getAttribute('title'),/Fintech strategic vision/);
 await page.setViewportSize({width:375,height:812});await page.goto(`${base}/case-studies/fintech/`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const search=await (await page.request.get(`${base}/assets/js/search-data.json`)).json();assert.equal(Object.values(search).filter(x=>/\/briefings\/fintech-.*\/#slide-/.test(x.url)).length,Object.values(decks).reduce((sum,slides)=>sum+slides.length,0));
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:812}});await nojs.goto(`${base}/case-studies/fintech/`);assert.equal(await nojs.locator('[data-workflow-stage]:visible').count(),8);assert.match(await nojs.locator('[data-model-output]').textContent(),/33 usable/);
 for(const [audience,slides] of Object.entries(decks)){await nojs.goto(`${base}/briefings/fintech-${audience}/`);assert.equal(await nojs.locator('.slide:visible').count(),slides.length);}
 await nojs.close();assert.deepEqual(errors,[]);
 console.log(`Passed: ${checks} fintech slide/viewport checks, real platform motion, evidence notes, six payment outcomes, capacity profiles, chart scale, invalid inputs, workflow links, reduced motion, embedded navigation, search and no-JS reading`);
} finally {await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
