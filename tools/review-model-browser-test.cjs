const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const base=(process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe').replace(/\/$/,'');
(async()=>{for(const engine of [chromium,webkit]){
 console.log('Checking',engine.name());const b=await engine.launch();try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const workflow of ['diagnosis','automation']){
   await p.goto(base+'/ai-adoption/?workflow='+workflow+'#layer-platform');
   const form=p.locator('.al-platform-assessment');await p.waitForFunction(w=>document.querySelector('[data-al-workflow]').value===w,workflow);
   await form.locator('button').click();await p.waitForURL(/platform-readiness/);assert.equal(new URL(p.url()).searchParams.get('workflow'),workflow);
   assert.equal(await p.locator('#readiness-scope').inputValue(),'scale');
   for(const dep of require('../_data/adoption.json').dependencies){const level=['platform','people','evidence'].includes(dep.id)?3:['infra','devops','virtualization','data','automation'].includes(dep.id)?0:2;await p.locator(`[data-dependency="${dep.id}"] [data-dependency-level]`).selectOption(String(level));}
   const gaps=await p.locator('[data-readiness-gaps] li').count();assert.equal(gaps,workflow==='diagnosis'?0:5);
  }
  await p.goto(base+'/case-studies/fintech/#value-attribution');
  const host=p.locator('[data-value-observations]');await p.locator('[data-value-actions]').waitFor();assert.match(await host.locator('[data-value-ai]').textContent(),/Not yet estimable/);
  const text={scope:'PAY-142 pack',acceptanceVersion:'AC-142',applicationBuild:'build-1',environmentVersion:'env-1',fixtureVersion:'fix-1',providerVersion:'provider-1',testVersion:'test-1',owner:'QA lead',evidenceRef:'Review test fixture'};
  for(const [arm,workHours]of [['existing',200],['modernized',120],['ai',140]]){
   const section=host.locator(`[data-value-arm="${arm}"]`);await section.locator('summary').click();
   for(const [field,value]of Object.entries({...text,workHours,reviewHours:10,reworkHours:5,operatingHours:5,setupHours:100,packs:2,attempts:3,failedAttempts:1}))await section.locator(`[data-value-field="${field}"]`).fill(String(value));
   await section.locator('[type="checkbox"]').check();
  }
  assert.match(await host.locator('[data-value-modernization]').textContent(),/40h less effort/);assert.match(await host.locator('[data-value-ai]').textContent(),/10h additional effort/);
  const download=p.waitForEvent('download');await host.locator('[data-value-export]').click();const saved=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));assert.equal(saved.result.ai.hours,-10);assert.equal(saved.observations.ai.failedAttempts,1);assert.equal(saved.observations.ai.setupHours,100);
  await host.locator('[data-value-arm="ai"] [data-value-field="environmentVersion"]').fill('other');assert.match(await host.locator('[data-value-ai]').textContent(),/Not yet estimable.*environmentVersion/);
  await p.setViewportSize({width:390,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await host.locator('[data-value-reset]').click();assert.match(await host.locator('[data-value-modernization]').textContent(),/Not yet estimable/);
  const nojs=await b.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base+'/ai-adoption/#layer-platform');await nojs.locator('[data-al-workflow]').selectOption('diagnosis');await nojs.locator('[data-al-workflow]').press('Tab');await nojs.keyboard.press('Enter');await nojs.waitForURL(/workflow=diagnosis/);
  assert.deepEqual(errors,[]);console.log(engine.name()+': workflow-specific platform links, matched attribution, missing controls, downloads, mobile and no-JS route passed');
 }finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1;});
