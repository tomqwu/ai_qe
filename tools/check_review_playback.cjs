const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const ranges=require('./media-ranges.cjs');
const base=(process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe').replace(/\/$/,'');
const playing=async audio=>audio.page().waitForFunction(a=>!a.paused&&a.currentTime>.1,await audio.elementHandle());
(async()=>{for(const engine of [chromium,webkit]){
 console.log('Checking',engine.name());const browser=await engine.launch();
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await ranges(p,base);
  await p.goto(base+'/briefings/fintech-technical/#slide-31');
  const audio=p.locator('[data-narration-audio]'),start=p.locator('[data-narration-start]'),auto=p.locator('[data-narration-auto]');
  await start.click();await playing(audio);await auto.uncheck();await start.click();await start.click();await playing(audio);assert.equal(await auto.isChecked(),false);
  await p.locator('[data-narration-play]').click();await p.locator('[data-narration-play]').click();await playing(audio);assert.equal(await auto.isChecked(),false);
  await p.locator('[data-narration-replay]').click();await playing(audio);assert.equal(await auto.isChecked(),false);
  await p.locator('[data-next]').click();assert.equal(await auto.isChecked(),false);await start.click();await playing(audio);
  const slide=new URL(p.url()).hash;await audio.evaluate(a=>a.currentTime=a.duration-.3);await p.waitForFunction(a=>a.ended,await audio.elementHandle());await p.waitForTimeout(2300);assert.equal(new URL(p.url()).hash,slide);assert.equal(await auto.isChecked(),false);
  await p.goto(base+'/qe-modernization/#environment');
  const figure=p.locator('[data-vs-lifecycle]'),guide=p.locator('[data-narrator-guide="technical/slide-25"]'),a=guide.locator('audio');
  await guide.locator('[data-guide-play]').click();await playing(a);
  const profile=require('../assets/data/narration-flows.json').profiles.find(x=>x.renderer==='lifecycle');
  const entry=require('../assets/data/narration.json').decks.technical.slides['slide-25'];
  const cues=await p.evaluate(t=>window.QENarrationMedia.parseCaptions(t),fs.readFileSync(entry.captions.slice(1),'utf8'));
  for(const cue of [...profile.cues].reverse()){
   assert.equal(cues[cue.caption].text.replace(/\s+/g,' ').trim(),cue.text);
   await a.evaluate((a,t)=>{a.pause();a.currentTime=t;},cues[cue.caption].start+.12);
   await p.waitForFunction(({f,i})=>f.dataset.audioCue===String(i),{f:await figure.elementHandle(),i:cue.caption});
   assert.deepEqual(await figure.locator('[aria-current="step"]').evaluateAll(n=>n.map(x=>x.dataset.flowNode)),cue.nodes);
  }
  for(const outcome of ['pass','test-failure','setup-failure']){
   await a.evaluate(a=>a.currentTime=9);if(await a.evaluate(a=>a.paused))await guide.locator('[data-guide-play]').click();await playing(a);
   await figure.locator('[data-vs-life-outcome]').selectOption(outcome);assert.equal(await a.evaluate(a=>a.paused),true);assert.equal(await guide.locator('[data-guide-caption]').textContent(),'');
   await figure.locator('[data-vs-life-next]').press('Enter');assert.equal(await figure.locator('[data-vs-life-outcome]').inputValue(),outcome);
   if(outcome==='setup-failure')assert.match(await figure.locator('[data-vs-life-status]').textContent(),/execution is skipped/);
   await guide.locator('[data-guide-play]').click();await playing(a);
   await p.waitForFunction(f=>f.dataset.flowMode==='narration' && f.querySelector('[data-flow-node="execute"]').getAttribute('aria-current')==='step',await figure.elementHandle());assert.equal(await figure.locator('[data-vs-life-outcome]').inputValue(),'pass');
   await figure.locator('[data-vs-life-reset]').click();assert.equal(await a.evaluate(a=>a.paused),true);assert.equal(await guide.locator('[data-guide-caption]').textContent(),'');
  }
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});await a.evaluate(a=>a.currentTime=9);
  await p.waitForFunction(f=>f.querySelector('[data-flow-node="execute"]').getAttribute('aria-current')==='step',await figure.elementHandle());
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  console.log(engine.name()+': Auto-next preference, real ended event, lifecycle caption cues, failure branches, replay, keyboard takeover and mobile passed');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exitCode=1;});
