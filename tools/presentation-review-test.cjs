// User-visible acceptance checks for the accepted v1.23 review.
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright');
const routes=require('../_data/briefing_routes.json');
const base=(process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe').replace(/\/$/,'');
(async()=>{for(const engine of [chromium,webkit]){const browser=await engine.launch();try{
 const p=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});let audioRequests=0;
 await p.addInitScript(()=>{window.reviewLayoutShift=0;if(PerformanceObserver.supportedEntryTypes?.includes('layout-shift'))new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.reviewLayoutShift+=entry.value}).observe({type:'layout-shift',buffered:true})});
 p.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))audioRequests++});
 await p.goto(base+'/briefings/technical/#slide-2');await p.locator('[data-narration-start]:not([disabled])').waitFor();
 assert.equal(await p.locator('.narration-panel').isVisible(),false);
 await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});
 assert.ok(await p.evaluate(()=>window.reviewLayoutShift<=.1),'Initial layout shift stays within the good threshold');
 for(const selector of ['.kicker','.slide-footer'])assert.ok(await p.locator('.slide:not([hidden]) '+selector).first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))>=12,'Minimum readable label size: '+selector);
 const width=await p.locator('.slides').evaluate(n=>n.getBoundingClientRect().width);
 await p.locator('[data-next]').click();const nextWidth=await p.locator('.slides').evaluate(n=>n.getBoundingClientRect().width);assert.ok(Math.abs(width-nextWidth)<1,'Flow controls do not change the frame');
 assert.equal(audioRequests,0,'No audio bytes before Play');
 await p.locator('[data-fullscreen]').click();
 const present=await p.locator('.slide:not([hidden])').boundingBox();assert.ok(present.height>=720*.85,'Present uses at least 85% of laptop height when idle');
 await p.keyboard.press('Escape');
 for(const route of Object.values(routes)){
  await p.goto(base+route.url+'?route=client#slide-1');await p.locator('[data-next]').waitFor();
  for(let i=0;i<route.slides.length;i++){
   assert.equal(new URL(p.url()).hash,'#slide-'+route.slides[i]);
   assert.match(await p.locator('.slide-status').innerText(),new RegExp(`Story ${i+1}/${route.slides.length}`));
   if(i<route.slides.length-1)await p.locator('[data-next]').click();
  }
  assert.equal(new URL(p.url()).hash,'#slide-'+route.closing);assert.ok(await p.locator('[data-next]').isDisabled());
 }
 await p.setViewportSize({width:1366,height:768});await p.goto(base+'/');assert.equal(await p.locator('iframe').count(),0);
 for(const href of ['/dictionary/','/releases/']){const box=await p.locator(`.sales-sidebar-footer a[href="/ai_qe${href}"]`).first().boundingBox();assert.ok(box&&box.y>=0&&box.y+box.height<=768,'Utility visible: '+href)}
 await p.goto(base+'/briefings/?for=evp');await p.locator('.room-filters:not([hidden])').waitFor();assert.equal(await p.locator('[data-route-audience="technical"]:visible').count(),0);
 await p.locator('[data-room-filter="technical"]').click();
 assert.equal(new URL(p.url()).searchParams.get('audience'),'technical');
 await p.reload();await p.locator('#briefing-frame').scrollIntoViewIfNeeded();
 const frame=await p.locator('#briefing-frame').elementHandle().then(n=>n.contentFrame());
 await frame.waitForURL(/briefings\/fintech-technical\/.*#slide-1$/);
 assert.match(await p.locator('#briefing-frame').getAttribute('title'),/Our Banking Client: engineering blueprint/);
 assert.equal(await p.locator('script[src*="jsdelivr"]').count(),0);
 for (const visit of [
  {path:'/', resource:'narration-guides.json', ready:'[data-guide-play]', wrapper:'.narrator-guide', requestsBefore:0},
  {path:'/briefings/technical/', resource:'narration.json', ready:'[data-narration-start]:not([hidden])', wrapper:'.narration-panel', requestsBefore:1}
 ]) {
  const lifecycle=await browser.newPage();let manifests=0;const lifecycleErrors=[];
  lifecycle.on('request',r=>{if(/\/narration\.json/.test(r.url()))manifests++});
  lifecycle.on('pageerror',e=>lifecycleErrors.push(e.message));
  await lifecycle.addInitScript(resource=>{
   const fetchResource=window.fetch.bind(window);let first=true;
   window.fetch=async(...args)=>{
    const response=await fetchResource(...args);
    if(first&&String(args[0]).includes(resource)){
     first=false;const read=response.json.bind(response);
     response.json=async()=>{const data=await read();await new Promise(resolve=>{window.finishNarrationParsing=resolve});return data};
    }
    return response;
   };
  },visit.resource);
  await lifecycle.goto(base+visit.path);await lifecycle.waitForFunction(()=>Boolean(window.finishNarrationParsing));
  await lifecycle.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.finishNarrationParsing()});
  await lifecycle.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.equal(manifests,visit.requestsBefore,'Leaving during initialization must not start a late manifest fetch');
  assert.equal(await lifecycle.locator(visit.wrapper).count(),0,'A departed page must not create narration controls');
  await lifecycle.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await lifecycle.locator(visit.ready).first().waitFor();
  assert.equal(manifests,visit.requestsBefore+1,'Restoring the page resumes interrupted initialization once');
  assert.deepEqual(lifecycleErrors,[]);await lifecycle.close();
 }
 console.log(engine.name()+': stable presentation frame, no eager audio, four closing routes, audience filter and visible utilities passed');
}finally{await browser.close()}}})().catch(e=>{console.error(e);process.exitCode=1});
