// Exercise the shipped recordings, semantic cue anchors and actual SVG clocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium, webkit} = require('playwright');
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const profiles = JSON.parse(fs.readFileSync('assets/data/narration-flows.json')).profiles;
const manifest = JSON.parse(fs.readFileSync('assets/data/narration.json'));
const routes = {'evp':'fintech-evp','technical':'fintech-technical','industry-evp':'evp','industry-technical':'technical'};
const sorted = values => [...new Set(values)].sort();
const platformProfile=profiles.find(p=>p.diagram==='platform'&&p.clip==='industry-technical/slide-2');
assert.deepEqual(sorted(platformProfile.cues.flatMap(c=>c.nodes)),sorted(['experience','delivery','context','runtime','gateway','checks','application','evaluation','release','evidence','corpus']),'Full walkthrough covers all eleven responsibilities');
async function seek(audio, time) {
  await audio.evaluate((a,t) => { a.pause(); a.currentTime=t; },time);
  await audio.page().waitForFunction(({a,t}) => !a.seeking && Math.abs(a.currentTime-t)<.15, {a:await audio.elementHandle(),t:time});
}
async function snapshot(figure) {
  return figure.evaluate(f => ({
    mode:f.dataset.flowMode, cue:f.dataset.audioCue,
    nodes:[...f.querySelectorAll('svg [data-flow-node].state-current')].map(n=>n.dataset.flowNode),
    routes:[...f.querySelectorAll('path.edge.route-focus')].map(p=>`${p.dataset.from}:${p.dataset.to}`),
    clock:f.querySelector('svg').getCurrentTime(),
    focused:[...f.querySelectorAll('svg [data-flow-node].state-current')].map(n=>({
      aria:n.getAttribute('aria-current'),fill:getComputedStyle(n.querySelector('rect')).fill,
      text:getComputedStyle(n.querySelector('text')).fill
    }))
  }));
}
(async () => {
 for (const engine of [chromium,webkit]) {
  const browser=await engine.launch();
  try {
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.setDefaultTimeout(15000);
   // Python's static CI server has no byte ranges; serve actual MP3 bytes with
   // the browser's requested ranges (same playback semantics as GitHub Pages).
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
   const toured=new Set(); let cueCount=0;
   for(const profile of profiles){
    const [deck,slide]=profile.clip.split('/');
    await page.goto(`${base}/briefings/${routes[deck]}/#${slide}`);
    const figure=page.locator(`#${slide} [data-diagram="${profile.diagram}"]`);
    const audio=page.locator('[data-narration-audio]');
    await page.locator('[data-narration-start]').waitFor();
    // Every standalone flow step highlights its actual destination, on pages
    // and slides alike. Legacy edge numbers require an explicit node ID.
    if(!toured.has(profile.diagram)){
     const result=await figure.evaluate(f=>{
      f.querySelector('[data-tour-reset]').click();
      const all=JSON.parse(f.querySelector('[data-tour-steps]').textContent);
      const paths=f.querySelector('[data-tour-branch]') ? ['fix','quarantine'] : [null];
      const checks=[];
      for(const path of paths){
       const select=f.querySelector('[data-tour-branch]');
       if(select){select.value=path;select.dispatchEvent(new Event('change'));}
       const steps=path?all.filter((s,i)=>(path==='fix'?[0,1,2,4]:[0,3,5]).includes(i)):all;
       for(const step of steps){
        f.querySelector('[data-tour-next]').click();
        const ids=step.routes.map(r=>r.split(':')[1]).concat(step.node).filter(id=>id && !/^\d+$/.test(id));
        checks.push({want:[...new Set(ids)].sort(),got:[...f.querySelectorAll('svg .state-current')].map(n=>n.dataset.flowNode).sort()});
       }
      }
      f.querySelector('[data-tour-reset]').click();return checks;
     });
     for(const check of result){assert.ok(check.want.length,profile.diagram+' has no semantic destination');assert.deepEqual(check.got,check.want,profile.diagram);}
     toured.add(profile.diagram);
    }
    await page.locator('[data-narration-start]').click();
    await page.waitForFunction(a=>!a.paused && a.currentTime>.15,await audio.elementHandle());
    const entry=manifest.decks[deck].slides[slide];
    const captions=await page.evaluate(text=>window.QENarrationMedia.parseCaptions(text),fs.readFileSync(entry.captions.slice(1),'utf8'));
    for(const [i,cue] of profile.cues.entries()){
     assert.equal(captions[cue.caption].text.replace(/\s+/g,' ').trim(),cue.text,profile.clip+' caption changed: re-author the visual cue');
     const time=captions[cue.caption].start+.1;
     await seek(audio,time);
     await page.waitForFunction(({f,cue})=>f.dataset.audioCue===String(cue),{f:await figure.elementHandle(),cue:cue.caption});
     const state=await snapshot(figure);
     assert.equal(state.mode,'narration');
     assert.deepEqual(sorted(state.nodes),sorted(cue.nodes),`${profile.clip}/${cue.caption} nodes`);
     assert.deepEqual(sorted(state.routes),sorted(cue.routes),`${profile.clip}/${cue.caption} routes`);
     state.focused.forEach(n=>{assert.equal(n.aria,'step');assert.equal(n.fill,'rgb(255, 240, 201)');assert.equal(n.text,'rgb(21, 46, 64)');});
     const end=profile.cues[i+1]?captions[profile.cues[i+1].caption].start:await audio.evaluate(a=>a.duration);
     assert.ok(Math.abs(state.clock-(time-captions[cue.caption].start)/(end-captions[cue.caption].start)*2.4)<.04,'SVG uses recorded time');
     cueCount++;
    }
   }
   assert.equal(toured.size,new Set(profiles.map(profile=>profile.diagram)).size);
   // Paused frame, playback speed, backwards seek, replay and manual inspection.
   await page.goto(base+'/briefings/technical/#slide-2');
   const figure=page.locator('#slide-2 [data-diagram="platform"]'),audio=page.locator('[data-narration-audio]');
   await page.locator('[data-narration-start]').click();
   await page.waitForFunction(a=>a.currentTime>.15,await audio.elementHandle());
   const platformCaptions=await page.evaluate(text=>window.QENarrationMedia.parseCaptions(text),fs.readFileSync(manifest.decks['industry-technical'].slides['slide-2'].captions.slice(1),'utf8'));
   const chapter=node=>{
    const index=platformProfile.cues.findIndex(c=>c.nodes.length===1&&c.nodes[0]===node);
    assert.ok(index>=0,'Component has a dedicated explanation: '+node);
    return {start:platformCaptions[platformProfile.cues[index].caption].start,end:platformCaptions[platformProfile.cues[index+1].caption].start};
   };
   const gateway=chapter('gateway'),context=chapter('context');
   await seek(audio,gateway.start+.5);let before=await snapshot(figure);
   await page.waitForTimeout(300);assert.equal((await snapshot(figure)).clock,before.clock,'Pause freezes the actual SVG clock');
   await page.locator('[data-narration-speed]').selectOption('1.5');
   await page.locator('[data-narration-play]').click();
   await page.waitForFunction(({a,time})=>a.currentTime>=time,{a:await audio.elementHandle(),time:gateway.start+1.2});
   before=await snapshot(figure);
   assert.equal(await audio.evaluate(a=>a.playbackRate),1.5);
   assert.ok(Math.abs(before.clock-(await audio.evaluate(a=>a.currentTime)-gateway.start)/(gateway.end-gateway.start)*2.4)<.08,'Motion follows faster narration');
   await seek(audio,context.start+.5);assert.deepEqual((await snapshot(figure)).nodes,['context']);
   await page.locator('[data-narration-replay]').click();
   await page.waitForFunction(f=>f.dataset.audioCue==='0',await figure.elementHandle());
   await page.locator('[data-flow-next]').click();
   assert.ok(await audio.evaluate(a=>a.paused),'Manual flow takes control and pauses audio');
   await page.locator('[data-narration-play]').click();await seek(audio,gateway.start+.5);
   await page.locator('#slide-2 [data-architecture-node="context"]').click();
   assert.ok(await audio.evaluate(a=>a.paused));
   assert.match(await figure.locator('[data-inspector-name]').textContent(),/Context/,'Manual inspector retains the requested component');
   await seek(audio,await audio.evaluate(a=>a.duration-.4));
   await page.locator('[data-narration-play]').click();
   await page.locator('.narration-panel[data-narration-state="between-slides"]').waitFor();
   await page.locator('[data-flow-next]').click();
   await page.waitForTimeout(2200);
   assert.equal(new URL(page.url()).hash,'#slide-2','Manual flow cancels a pending automatic slide transition');
   // Same timeline in the homepage's full architecture and readable mobile view.
   await page.goto(base+'/#explore');
   const home=page.locator('figure[data-diagram="platform"]'),guide=page.locator('[data-narrator-guide="industry-technical/slide-2"]');
   await guide.locator('[data-guide-play]').click();
   const narration=guide.locator('audio');await page.waitForFunction(a=>a.currentTime>.15,await narration.elementHandle());
   await seek(narration,gateway.start+.5);assert.deepEqual((await snapshot(home)).nodes,['gateway']);
   assert.match(await guide.locator('.narrator-guide-credit').textContent(),/Full architecture walkthrough/);
   await seek(narration,await narration.evaluate(a=>a.duration-.3));
   await guide.locator('[data-guide-play]').click();
   await page.waitForFunction(a=>a.ended,await narration.elementHandle());
   await page.waitForFunction(g=>g.querySelector('.narrator-guide-status').textContent.includes('Explanation complete'),await guide.elementHandle());
   assert.match(await guide.locator('.narrator-guide-status').textContent(),/Explanation complete/);
   await guide.locator('[data-guide-play]').click();
   await page.waitForFunction(a=>!a.paused&&a.currentTime>.15,await narration.elementHandle());
   assert.doesNotMatch(await guide.locator('.narrator-guide-status').textContent(),/Explanation complete/,'Replay restores the active explanation status');
   await page.setViewportSize({width:390,height:844});
   await page.emulateMedia({reducedMotion:'reduce'});
   await seek(narration,context.start+.5);
   assert.deepEqual((await snapshot(home)).nodes,['context']);
   assert.equal(await home.locator('.diagram-overview [aria-current="step"]').count(),1,'Readable summary follows the same current state');
   assert.equal(await home.locator('.flow-effect.route-focus').first().isVisible(),false,'Reduced motion keeps focus without moving packets');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   // A changed recording must not silently inherit stale visual timing.
   await page.route('**/assets/data/narration-flows.json*',route=>{
    const data=JSON.parse(fs.readFileSync('assets/data/narration-flows.json'));
    data.profiles[0].cues[0].text='A different recording';
    return route.fulfill({json:data});
   });
   await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
   await page.goto(base+'/briefings/technical/#slide-2');
   await page.locator('[data-narration-start]').click();
   const changedAudio=page.locator('[data-narration-audio]');
   await page.waitForFunction(a=>a.currentTime>.15,await changedAudio.elementHandle());
   await seek(changedAudio,7.5);
   const fallback=await snapshot(page.locator('#slide-2 [data-diagram="platform"]'));
   assert.equal(fallback.cue,'overview');assert.deepEqual(fallback.nodes,[]);assert.deepEqual(fallback.routes,[]);
   assert.deepEqual(errors,[]);
   console.log(`${engine.name()}: ${toured.size} flow diagrams, ${profiles.length} recordings, ${cueCount} caption-aligned states; pause, seek, speed, replay, manual control, mobile and reduced motion passed`);
  }finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exit(1);});
