const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();try{
   const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/platform-readiness/');
   assert.equal(await page.locator('[data-dependency]').count(),12);
   assert.equal(await page.locator('[data-readiness-decision]').getAttribute('data-ready'),'false');
   assert.match(await page.locator('[data-readiness-summary]').textContent(),/0 of/);
   assert.equal(await page.locator('#conversation-nav [aria-current="page"]').count(),1);
   await page.locator('#readiness-preset').selectOption('repeatable');
   assert.equal(await page.locator('[data-readiness-decision]').getAttribute('data-ready'),'true');
   await page.locator('#readiness-scope').selectOption('scale');
   assert.equal(await page.locator('[data-readiness-gaps] li').count(),3);
   await page.locator('#readiness-preset').selectOption('reused');
   await page.locator('#dependency-virtualization select').selectOption('0');
   assert.equal(await page.locator('[data-readiness-decision]').getAttribute('data-ready'),'false');
   assert.equal(await page.locator('[data-readiness-gaps] li').count(),1);
   await page.locator('#readiness-workflow').selectOption('requirements');
   assert.equal(await page.locator('[data-readiness-decision]').getAttribute('data-ready'),'true');
   await page.locator('#readiness-workflow').selectOption('automation');
   await page.locator('#dependency-virtualization textarea').fill('Integration owner · contract check · 2026-09-14');
   const pending=page.waitForEvent('download');await page.locator('[data-readiness-export]').click();const download=await pending;
   const sheet=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
   assert.match(sheet.status,/not verified or approved/);assert.equal(sheet.dependencies.length,12);
   assert.equal(sheet.dependencies.find(d=>d.id==='virtualization').level,0);assert.match(sheet.dependencies.find(d=>d.id==='virtualization').notes,/Integration owner/);
   await page.reload();assert.equal(await page.locator('#dependency-virtualization textarea').inputValue(),'');
   for(const width of [320,390,768,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.goto(base+'/platform-readiness/?preset=harbor&workflow=environment');
    assert.equal(await page.locator('#readiness-preset').inputValue(),'harbor');
    assert.equal(await page.locator('#readiness-workflow').inputValue(),'environment');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${engine.name()}/${width}: overflow`);
    await page.locator('[data-map-dependency="virtualization"]').click();assert.equal(new URL(page.url()).hash,'#dependency-virtualization');
   }
   await page.goto(base+'/case-studies/fintech/#workflow-environment');
   await page.locator('#workflow-environment .adoption-link-note a').click();
   assert.equal(await page.locator('#readiness-workflow').inputValue(),'environment');
   await page.goto(base+'/');await page.locator('#search-input').fill('service virtualization');
   await page.locator('.search-result[href$="/platform-readiness/#dependency-virtualization"]').click();
   await page.waitForURL('**/platform-readiness/**#dependency-virtualization');
   await page.waitForFunction(()=>{const r=document.getElementById('dependency-virtualization')?.getBoundingClientRect();return r&&r.top>=0&&r.top<innerHeight;});
   const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base+'/platform-readiness/');
   assert.equal(await nojs.locator('[data-dependency]:visible').count(),12);assert.ok(await nojs.locator('.readiness-controls').isHidden());
   assert.deepEqual(errors,[]);console.log(`Passed: ${engine.name()} readiness gates, 12 assumptions, workflow links, exported notes, five viewports and no-JS access`);
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
