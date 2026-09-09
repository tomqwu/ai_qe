const assert=require('node:assert/strict'),{chromium}=require('playwright');
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
(async()=>{const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/demos/architecture/?scenario=generate`);await page.waitForFunction(()=>window.qeArchitecture?.ready,{},{timeout:60000});
 assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.modules),11,'All Blender modules must load');
 assert.ok(await page.locator('[data-play]').isVisible());
 assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.cinematic),false,'The camera starts steady so labels can be read');
 assert.equal(await page.locator('[data-role-legend]>span').count(),4,'Four roles have explicit text badges');
 assert.equal(await page.locator('.scene-label:not([hidden])').count(),4,'Focus view labels only the current participants');
 await page.locator('button[data-overview]').click();assert.equal(await page.locator('.scene-label:not([hidden])').count(),11);await page.locator('button[data-overview]').click();
 await page.locator('#playback-rate').selectOption('0.75');assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.playbackRate),.75);await page.locator('#playback-rate').selectOption('1');
 const contrast=await page.evaluate(()=>{
  const luminance=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
  return [...document.querySelectorAll('.step-body,.flow-summary,.scene-label:not([hidden]),.role-legend b')].map(e=>{const style=getComputedStyle(e);let bg=e;while(getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)')bg=bg.parentElement;const a=luminance(style.color),b=luminance(getComputedStyle(bg).backgroundColor);return {text:e.textContent,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
 });assert.ok(contrast.every(c=>c.ratio>=4.5),JSON.stringify(contrast));
 await page.locator('[data-replay]').click();
 const signal=await page.evaluate(()=>window.qeArchitecture.snapshot.signals[0].position);
 await page.waitForFunction(p=>{const q=window.qeArchitecture.snapshot.signals[0].position;return Math.hypot(...q.map((v,i)=>v-p[i]))>.03},signal,{timeout:10000});
 await page.locator('[data-play]').click();const paused=await page.evaluate(()=>window.qeArchitecture.snapshot.elapsed);await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.elapsed),paused,'Pause must freeze the story');
 const idleFrames=await page.locator('#architecture-demo').getAttribute('data-render-frame');await page.waitForTimeout(250);assert.equal(await page.locator('#architecture-demo').getAttribute('data-render-frame'),idleFrames,'A steady paused scene does not redraw needlessly');
 const canvas=page.locator('#architecture-canvas'),rect=await canvas.boundingBox();await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.5+70,rect.y+rect.height*.5+25,{steps:5});await page.mouse.up();await page.waitForFunction(frame=>document.querySelector('#architecture-demo').dataset.renderFrame!==frame,idleFrames);await page.locator('[data-reset-camera]').click();
 await page.locator('[data-scenario="deny"]').click();await page.locator('[data-next]').click();
 assert.equal(await page.locator('[data-state]').innerText(),'DENIED');
 assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.routes),[],'A denied request must not reach a tool');
 await page.locator('[data-next]').click();assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.routes),['gateway:evidence'],'Only the denial receipt leaves the gateway');
 await page.locator('[data-scenario="hold"]').click();await page.locator('[data-next]').click();assert.equal(await page.locator('[data-state]').innerText(),'FAILED');await page.locator('[data-next]').click();assert.equal(await page.locator('[data-state]').innerText(),'HOLD');assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.node),'release');
 await page.locator('[data-scenario="evaluate"]').click();await page.locator('[data-next]').click();assert.deepEqual(await page.evaluate(()=>window.qeArchitecture.snapshot.routes),['application:evaluation'],'AI evaluation is separate from generated-test execution');
 await page.locator('#component-select').selectOption('gateway');assert.match(await page.locator('[data-component-detail]').innerText(),/before a tool runs/);assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.playing),false);
 const layout=await page.evaluate(()=>{const c=document.querySelector('.scene-view').getBoundingClientRect(),p=document.querySelector('.playback').getBoundingClientRect();return {sceneBottom:c.bottom,controlsTop:p.top,controlsBottom:p.bottom,height:innerHeight,wide:document.documentElement.scrollWidth>innerWidth}});assert.ok(layout.sceneBottom<=layout.controlsTop);assert.ok(layout.controlsBottom<=layout.height);assert.ok(!layout.wide);
 await page.setViewportSize({width:390,height:844});assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'No mobile horizontal overflow');assert.ok(await page.locator('#component-select').isVisible());
 const narratives=require('../../assets/data/architecture-demo.json').scenarios;
 for(const size of [{width:1265,height:712},{width:390,height:844}]){
  await page.setViewportSize(size);
  for(const story of narratives){let time=0;for(const stage of story.steps){await page.evaluate(({time,id})=>window.qeArchitecture.seek(time,id),{time,id:story.id});
   const collisions=await page.evaluate(()=>{const labels=[...document.querySelectorAll('.scene-label:not([hidden])')].map(e=>({name:e.textContent,r:e.getBoundingClientRect()}));return labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name]))});assert.deepEqual(collisions,[],`Labels overlap at ${size.width}px in ${story.id}: ${stage.title}`);time+=stage.duration;}
  }
 }
 await page.evaluate(()=>window.qeArchitecture.seek(0,'generate'));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-play]').disabled,{},{timeout:5000}).catch(async error=>{console.error('Motion diagnostic',await page.evaluate(()=>({media:matchMedia('(prefers-reduced-motion: reduce)').matches,disabled:document.querySelector('[data-play]').disabled,status:document.querySelector('#architecture-demo').dataset.status,snapshot:window.qeArchitecture.snapshot})));throw error});await page.locator('[data-next]').click();assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.playing),false);
 await page.goto(`${base}/demos/architecture/?no3d=1`);await page.locator('.scene-fallback').waitFor({state:'visible'});await page.locator('[data-next]').click();assert.match(await page.locator('[data-step-title]').innerText(),/Draft a test/,'Text walkthrough survives without WebGL');
 await page.setViewportSize({width:1920,height:1080});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(`${base}/demos/architecture/?capture=1`);await page.waitForFunction(()=>window.qeArchitecture?.ready);
 for(let t=0;t<49;t+=7){await page.evaluate(t=>window.qeArchitecture.seek(t),t);const sizes=await page.evaluate(()=>{const p=document.querySelector('.story-panel');return {content:p.scrollHeight,available:p.clientHeight}});assert.ok(sizes.content<=sizes.available,`Film stage ${t/7+1} text must fit: ${JSON.stringify(sizes)}`)}
 // Model the observed browser behavior: the media query updates, but its change event is delayed or lost.
 await page.addInitScript(()=>{const original=window.matchMedia;window.matchMedia=function(query){const media=original.call(window,query);if(query==='(prefers-reduced-motion: reduce)')media.addEventListener=()=>{};return media}});
 await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/demos/architecture/?scenario=generate`);await page.waitForFunction(()=>window.qeArchitecture?.ready);
 for(const value of [true,false,true,false]){await page.emulateMedia({reducedMotion:value?'reduce':'no-preference'});await page.waitForFunction(value=>document.querySelector('[data-play]').disabled===value,value,{timeout:10000});assert.equal(await page.locator('[data-cinematic]').isEnabled(),!value);assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.playing),false,'Preference changes never restart playback automatically');}
 assert.deepEqual(errors,[]);console.log('Passed: Blender model loading, actual 3D motion, readable contrast, focus/full map, steady camera, adjustable pace, film text fit, pause, denial and hold semantics, AI evaluation branch, inspection, desktop/mobile layout, reduced motion including lost preference events and WebGL fallback');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
