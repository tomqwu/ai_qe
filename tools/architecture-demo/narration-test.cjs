// Exercise actual MP3 playback against the narrated 3D story, never a synthetic timer.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const base=(process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe').replace(/\/$/,'');
const guides=require('../../assets/data/narration-guides.json').demo;
const captions=id=>fs.readFileSync(`assets/audio/chris-v1.17.0/industry-technical/${guides[id].slide}.vtt`,'utf8').trim().split('\n\n').slice(1).map(block=>{const [h,m,s]=block.split(' --> ')[0].split(':').map(Number);return h*3600+m*60+s});
async function seek(page,time){await page.locator('[data-guide-audio]').evaluate((a,t)=>{a.pause();a.currentTime=t},time);await page.waitForFunction(t=>{const a=document.querySelector('[data-guide-audio]');return !a.seeking&&Math.abs(a.currentTime-t)<.1&&Math.abs(window.qeArchitecture.snapshot.elapsed-t)<.1},time)}
async function playing(page){await page.waitForFunction(()=>{const a=document.querySelector('[data-guide-audio]');return !a.paused&&!a.seeking&&a.currentTime>.1&&window.qeArchitecture.snapshot.synced})}
(async()=>{for(const engine of [chromium,webkit]){
 const browser=await engine.launch(engine===chromium?{args:['--enable-unsafe-swiftshader']}:{});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
   const cache=new Map();
   await page.route('**/assets/audio/**/*.mp3',async route=>{
    const url=route.request().url();
    if(!cache.has(url)){const headers={...route.request().headers()};delete headers.range;const response=await route.fetch({headers});assert.ok(response.ok());cache.set(url,await response.body());}
    const bytes=cache.get(url),match=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/),headers={'accept-ranges':'bytes'};
    if(!match)return route.fulfill({contentType:'audio/mpeg',headers,body:bytes});
    const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;
    headers['content-range']=`bytes ${start}-${end}/${bytes.length}`;
    return route.fulfill({status:206,contentType:'audio/mpeg',headers,body:bytes.subarray(start,end+1)});
   });

  // A visitor can start narration while the authored GLB is still loading.
  let releaseModel;const modelGate=new Promise(resolve=>{releaseModel=resolve});
  const delayedModel=async route=>{await modelGate;await route.continue()};
  await page.route('**/assets/models/*.glb*',delayedModel);
  await page.goto(base+'/demos/architecture/?scenario=deny');
  await page.locator('[data-guide-play]').click();await playing(page);releaseModel();
  await page.waitForFunction(()=>['ready','fallback'].includes(document.querySelector('#architecture-demo').dataset.status));
  assert.equal(await page.locator('[data-scenario][aria-pressed="true"]').getAttribute('data-scenario'),'deny');
  assert.equal(await page.locator('[data-scenario-label]').innerText(),'DENY UNSAFE ACTION');
  assert.equal(await page.locator('[data-guide-audio]').evaluate(a=>a.paused),false,'Model readiness does not interrupt narration');
  await page.unroute('**/assets/models/*.glb*',delayedModel);
  await page.goto(base+'/demos/architecture/?scenario=generate');
  await page.waitForFunction(()=>['ready','fallback'].includes(document.querySelector('#architecture-demo').dataset.status));
  const rendered=await page.evaluate(()=>window.qeArchitecture.ready);
  if(engine===chromium)assert.equal(rendered,true,'Chromium must verify the actual rendered Blender model');
  assert.equal(await page.locator('[data-guide-audio]').evaluate(a=>a.paused),true,'No audio autoplay');
  let count=0;
  for(const [id,guide] of Object.entries(guides)){
   await page.locator(`[data-scenario="${id}"]`).click();
   await page.locator(`[data-narrator-guide="${guide.deck}/${guide.slide}"]`).waitFor();
   assert.equal(await page.locator('[data-guide-audio]').count(),1);
   await page.locator('[data-guide-play]').click();await playing(page);
   const times=captions(id),cues=guide.story;
   for(let i=0;i<cues.length;i++){
    const cue=cues[i],start=times[cue.caption];await seek(page,start+.12);
    const snapshot=await page.evaluate(()=>window.qeArchitecture.snapshot);
    assert.equal(snapshot.clock,'audio');assert.equal(snapshot.stage,i);
    assert.deepEqual(snapshot.activeNodes,cue.nodes);assert.deepEqual(snapshot.routes,cue.routes);
    assert.equal(await page.locator('[data-step-title]').innerText(),cue.title);
    assert.ok(Math.abs(Number(await page.locator('#story-progress').getAttribute('max'))-snapshot.duration)<.01);
    if(rendered){
     assert.deepEqual((await page.locator('.scene-label[data-active="true"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.node))).sort(),[...cue.nodes].sort());
     assert.deepEqual(snapshot.signals.map(s=>s.route).sort(),[...cue.routes].sort());
    }
    assert.ok((await page.locator('[data-guide-caption]').innerText()).trim().length>0);
    if(id==='deny')assert.ok(snapshot.routes.every(r=>!r.includes(':checks')),'Denial never invokes a tool');
    if(id==='hold'&&i>=2)assert.equal(await page.locator('[data-state]').innerText(),'HOLD','The failed-proof scenario never becomes an approved rollout');
    count++;
   }
   // Let the actual recording cross a cue boundary: the next section and destination must follow.
   await seek(page,times[cues[1].caption]-.35);
   await page.locator('[data-play]').click();await playing(page);
   await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===1);
   await page.locator('[data-guide-play]').click();
   await page.waitForFunction(()=>document.querySelector('[data-guide-audio]').paused&&!window.qeArchitecture.snapshot.playing);
   const frozen=await page.evaluate(()=>window.qeArchitecture.snapshot);
   await page.waitForTimeout(180);
   const paused=await page.evaluate(()=>window.qeArchitecture.snapshot);
   assert.equal(paused.elapsed,frozen.elapsed);assert.deepEqual(paused.signals,frozen.signals,'Audio pause freezes packets');
   // Both speed selectors affect the same recording and clock.
   await page.locator('#playback-rate').selectOption('1.5');
   await page.waitForFunction(()=>document.querySelector('[aria-label="Explanation speed"]').value==='1.5');
   await page.locator('[aria-label="Explanation speed"]').selectOption('1.25');
   await page.waitForFunction(()=>document.querySelector('#playback-rate').value==='1.25');
   await page.locator('[data-next]').click();await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===2);
   assert.equal(await page.locator('[data-guide-audio]').evaluate(a=>a.paused),true);
   await page.locator('[data-previous]').click();await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===1);
   // The story slider seeks the recording; native seek completion matters in WebKit.
   await page.locator('#story-progress').evaluate((slider,t)=>{slider.value=t;slider.dispatchEvent(new Event('input',{bubbles:true}))},times[cues[2].caption]+.2);
   await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===2&&!document.querySelector('[data-guide-audio]').seeking);
   if(rendered&&cues[2].routes.length){
    const position=await page.evaluate(()=>window.qeArchitecture.snapshot.signals);
    await page.locator('[data-play]').click();await playing(page);await page.waitForTimeout(220);
    assert.notDeepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.signals),position,'Arrows actually travel while the audio runs');
   }
   await page.locator('#component-select').selectOption('gateway');
   assert.equal(await page.locator('[data-guide-audio]').evaluate(a=>a.paused),true,'Inspection pauses the explanation');
   await page.locator('[data-replay]').click();await playing(page);
   await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===0);
   assert.equal(await page.locator('#component-select').inputValue(),'','Replay restores narration focus');
   const duration=await page.locator('[data-guide-audio]').evaluate(a=>a.duration);
   await seek(page,duration-.25);await page.locator('[data-play]').click();
   await page.waitForFunction(()=>document.querySelector('[data-guide-audio]').ended);
   await page.waitForFunction(()=>!window.qeArchitecture.snapshot.playing);
   assert.equal(await page.locator('[data-play]').getAttribute('aria-pressed'),'false');
   assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.stage),cues.length-1,'Stop at final spoken section');
  }
  // Reduced motion keeps destination highlights and captions while suppressing travel.
  await page.locator('[data-scenario="generate"]').click();await page.locator('[data-narrator-guide="industry-technical/slide-3"]').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-guide-play]').click();await playing(page);await seek(page,10);
  assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.activeNodes),['runtime','gateway']);
  assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.signals),[]);
  assert.equal(await page.locator('[data-play]').isEnabled(),true,'Reduced motion still allows audio');
  await page.locator('[data-play]').click();await playing(page);
  await page.locator('[data-unlink-audio]').click();
  assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.clock),'story');
  assert.equal(await page.locator('[data-guide-audio]').evaluate(a=>a.paused),true);
  assert.match(await page.locator('[data-progress-label]').innerText(),/^Stage/);
  await page.locator('[data-next]').click();
  await page.emulateMedia({reducedMotion:'no-preference'});
  // The original seven-stage walkthrough remains available, followed by audio re-entry.
  await page.locator('[data-guide-play]').click();await playing(page);
  await seek(page,10);
  for(const width of [320,390,760,820,1024,1440]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),'Audio controls fit the viewport');
  }
  await page.locator('[data-guide-play]').click();
  // Invalid anchors fail safely instead of running an unrelated timer.
  await page.route('**/industry-technical/slide-3.vtt',async route=>{
   const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('The generated payment test','Changed recording text')});
  });
  await page.goto(base+'/demos/architecture/?scenario=generate&no3d=1');
  await page.locator('.scene-fallback').waitFor({state:'visible'});
  await page.locator('[data-guide-play]').click();
  await page.waitForFunction(()=>document.querySelector('[data-guide-audio]').currentTime>.5);
  assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.synced),false);
  assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.routes),[]);
  assert.match(await page.locator('[data-run-label]').innerText(),/STATIC OVERVIEW/);
  assert.deepEqual(errors,[]);
  console.log(`${engine.name()}: ${count} authored audio sections, real playback boundaries, visible highlights, arrows, shared transport, inspection, final stop, reduced motion, mobile and changed-caption fallback passed`);
 }finally{await browser.close()}
}})().catch(e=>{console.error(e);process.exitCode=1});
