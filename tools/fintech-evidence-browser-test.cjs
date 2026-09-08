const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const data=require('../_data/fintech_evidence.json');
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
const route='/case-studies/fintech/evidence/';
(async()=>{
 const ids=new Set(data.sources.map(source=>source.id));
 assert.equal(ids.size,10);
 for(const c of data.cases)assert.ok(ids.has(c.source));
 for(const p of data.practices)for(const id of p.sources)assert.ok(ids.has(id));
 assert.deepEqual(require('../assets/data/fintech-evidence-sources.json'),data.sources);
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  try{
   const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('[data-fe-case]:visible').count(),7);
   assert.equal(await page.locator('#dependencies [data-fe-modernization]').count(),6);
   for(const [category,count] of [['ai-qe',3],['foundation',2],['adjacent',2],['all',7]]){
    await page.locator(`[data-filter="${category}"]`).click();
    assert.equal(await page.locator('[data-fe-case]:visible').count(),count);
    assert.equal(new URL(page.url()).searchParams.get('evidence'),category);
    await page.reload();assert.equal(await page.locator('[data-fe-case]:visible').count(),count);
   }
   await page.goto(base+route+'?evidence=foundation#case-libra');assert.ok(await page.locator('#case-libra').isVisible());
   await page.goto(base+route+'?evidence=bad&pilot=bad');assert.equal(await page.locator('[data-fe-case]:visible').count(),7);assert.equal(await page.locator('[data-fe-pilot-select]').inputValue(),'design');
   for(const pilot of data.pilots){
    await page.locator('[data-fe-pilot-select]').selectOption(pilot.id);await page.reload();
    assert.equal(await page.locator('[data-fe-pilot]:visible').count(),1);
    assert.equal(await page.locator('[data-fe-pilot-select]').inputValue(),pilot.id);
    const downloaded=page.waitForEvent('download');await page.locator('[data-fe-export]').click();
    const file=await downloaded;const content=fs.readFileSync(await file.path(),'utf8');
    for(const field of ['title','dependency','modernization','output','measure','gate','fail','question'])assert.ok(content.includes(pilot[field]),field);
    assert.ok(content.includes('Client readiness and savings require validation.'));
    assert.ok(content.includes('An unresolved execution dependency blocks that execution scope.'));
    assert.ok(content.includes('https://tomqwu.github.io/ai_qe/qe-modernization/#workstreams'));
    const href=await page.locator('[data-fe-pilot]:visible [data-fe-readiness]').getAttribute('href');
    const assessment=await browser.newPage();await assessment.goto(new URL(href,base).href);
    assert.equal(await assessment.locator('#readiness-workflow').inputValue(),pilot.readiness_workflow);
    assert.equal(await assessment.locator('#readiness-preset').inputValue(),'unknown');
    assert.equal(await assessment.locator('#readiness-scope').inputValue(),'pilot');
    assert.ok(content.includes(`workflow=${pilot.readiness_workflow}#assessment`));await assessment.close();
   }
   const exported=await page.request.get(base+'/assets/data/fintech-evidence-sources.json');assert.deepEqual(await exported.json(),data.sources);
   const csv=await (await page.request.get(base+'/assets/data/fintech-evidence-sources.csv')).text();for(const source of data.sources)assert.ok(csv.includes(source.url));
   const values=await page.locator('.fe-results [data-fe-value]').evaluateAll(items=>items.map(item=>+item.dataset.feValue));assert.deepEqual(values,data.featured.flatMap(item=>[item.before,item.after]));
   const figure=page.locator('.fe-validation');await figure.scrollIntoViewIfNeeded();
   await figure.locator('[data-tour-reset]').click();await figure.locator('[data-tour-play]').click();
   const packet=figure.locator('.flow-effect.route-focus .flow-packet').first();await packet.waitFor({state:'visible'});
   const before=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));await page.waitForTimeout(250);
   const after=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>1);
   await figure.locator('[data-tour-play]').click();const time=await figure.locator('svg').evaluate(el=>el.getCurrentTime());await page.waitForTimeout(150);assert.ok(Math.abs(await figure.locator('svg').evaluate(el=>el.getCurrentTime())-time)<.03);
   await figure.locator('[data-tour-reset]').click();for(const step of data.flow)await figure.locator('[data-tour-next]').click();
   assert.match(await figure.locator('[data-tour-status]').textContent(),/Invalid candidates return for correction/);
   assert.equal(await figure.locator('path.edge[data-to="rework"]').evaluate(el=>el.classList.contains('route-focus')),true);
   assert.equal(await figure.locator('path.edge[data-to="evidence"]').evaluate(el=>el.classList.contains('route-focus')),false);
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.fe-validation [data-tour-play]').disabled);assert.ok(await figure.locator('[data-tour-play]').isDisabled());
   await figure.getByRole('button',{name:'Readable overview',exact:true}).click();assert.equal(await figure.locator('.diagram-overview li strong').count(),6);
   for(const width of [320,390,768,1024,1440,2560]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${engine.name()}/${width} overflow`);}
   await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');await page.locator('#search-input').fill('Libra');await page.locator('.search-result[href$="/case-studies/fintech/evidence/#case-libra"]').click();await page.waitForURL('**/case-studies/fintech/evidence/#case-libra');assert.ok(await page.locator('#case-libra').isVisible());
   const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base+route);assert.equal(await nojs.locator('[data-fe-case]:visible').count(),7);assert.equal(await nojs.locator('[data-fe-pilot]:visible').count(),3);
   assert.deepEqual(errors,[]);console.log(`Passed: ${engine.name()} fintech evidence filters, deep links, three full trial exports, chart/source agreement, rejection-route motion, reduced motion, six widths, search and no-JS reading`);
  }finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
