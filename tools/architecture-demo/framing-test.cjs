// Validate the loaded model's projected bounds, not just CSS or camera constants.
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright');
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
async function framing(page){
 await page.waitForFunction(()=>{const f=window.qeArchitecture?.framing;return f&&Math.abs(f.projectionAspect-f.width/f.height)<.0001});
 return page.evaluate(()=>window.qeArchitecture.framing);
}
function checkFit(f){
 assert.ok(Math.abs(f.projectionAspect-f.width/f.height)<.0001,'Equal horizontal and vertical projection scale');
 assert.ok(f.groundDepth>.75,'The default view retains three quarters of the ground-plane depth instead of flattening it');
 assert.ok(f.corners.every(([x,y])=>Math.abs(x)<.95&&Math.abs(y)<.95),'The complete model has clear margins: '+JSON.stringify(f));
}
(async()=>{for(const engine of [chromium,webkit]){
 const browser=await engine.launch();try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1.5}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/demos/architecture/?scenario=generate');await page.waitForFunction(()=>window.qeArchitecture?.ready,{},{timeout:60000});
  const home=await framing(page);checkFit(home);
  for(const size of [{width:1920,height:1200},{width:1265,height:712},{width:1920,height:700},{width:900,height:1400},{width:390,height:844}]){
   await page.setViewportSize(size);checkFit(await framing(page));
  }
  await page.setViewportSize({width:1440,height:1000});await framing(page);
  const rect=await page.locator('#architecture-canvas').boundingBox();
  await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);await page.mouse.wheel(0,-600);
  await page.waitForFunction(()=>window.qeArchitecture.framing.zoom>1.2);
  await page.mouse.down();await page.mouse.move(rect.x+rect.width*.6,rect.y+rect.height*.55,{steps:5});await page.mouse.up();
  // Click while damping can still be active: reset must not drift away again.
  await page.locator('[data-reset-camera]').click();await page.waitForTimeout(250);
  const reset=await framing(page);assert.equal(reset.zoom,1);checkFit(reset);
  assert.ok(reset.position.every((v,i)=>Math.abs(v-home.position[i])<.00001),'Reset restores the camera angle');
  assert.ok(reset.target.every((v,i)=>Math.abs(v-home.target[i])<.00001),'Reset restores the center');
  await page.waitForTimeout(250);assert.deepEqual((await framing(page)).position,reset.position,'No residual orbit drift');
  for(const size of [{width:1265,height:712},{width:390,height:844}]){
   await page.setViewportSize(size);await page.evaluate(()=>window.qeArchitecture.setCameraCinema(true));
   for(const time of [0,7,14,21,28,35,42,48]){await page.evaluate(t=>window.qeArchitecture.seek(t),time);checkFit(await framing(page));}
   await page.locator('[data-reset-camera]').click();checkFit(await framing(page));
   assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.cinematic),false);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-reset-camera]').click();checkFit(await framing(page));
  assert.deepEqual(errors,[]);
  console.log(`${engine.name()}: proportional projection, complete model margins at five viewport shapes, elevated camera motion, zoom/orbit reset without drift, and reduced motion passed`);
 }finally{await browser.close()}
}})().catch(e=>{console.error(e);process.exit(1)});
