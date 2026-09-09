// Real media events across visible pages, embedded decks and delayed requests.
// The short WAV stays in memory; accepted publication recordings are unchanged.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const sampleRate=16000, seconds=8, bytes=sampleRate*seconds*2, wav=Buffer.alloc(44+bytes);
wav.write('RIFF');wav.writeUInt32LE(36+bytes,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);
wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(bytes,40);
for(let i=0;i<sampleRate*seconds;i++)wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*220/sampleRate)*100),44+i*2);
const deckAudio='[data-narration-audio]';
// Hidden/offscreen frames can suspend animation frames while media keeps playing.
async function playing(scope, selector=deckAudio){await scope.waitForFunction(s=>{const a=document.querySelector(s);return a&&!a.paused&&a.currentTime>.05},selector,{polling:100})}
async function paused(scope, selector=deckAudio){await scope.waitForFunction(s=>document.querySelector(s)?.paused,selector,{polling:100})}
async function start(page){await page.locator('[data-narration-start]').click();await playing(page)}
async function enterGap(page){
 await page.locator('.deck-navigation select').selectOption('0');
 await start(page);await page.locator('[data-narration-seek]').fill('7.85');
 await page.waitForFunction(()=>document.querySelector('.narration-panel').dataset.narrationState==='between-slides');
}
function serveWav(route){
 const range=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/),headers={'accept-ranges':'bytes'};
 if(!range)return route.fulfill({contentType:'audio/wav',headers,body:wav});
 const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),wav.length-1):wav.length-1;
 headers['content-range']=`bytes ${start}-${end}/${wav.length}`;
 return route.fulfill({status:206,contentType:'audio/wav',headers,body:wav.subarray(start,end+1)});
}
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  try{
   for(const storageOnly of [false,true]){
    const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
    if(storageOnly)await context.addInitScript(()=>{window.BroadcastChannel=undefined});
    context.on('page',page=>{page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message))});
    await context.route('**/assets/audio/**',route=>/\.(mp3|wav)(?:\?|$)/.test(route.request().url())?serveWav(route):route.continue());
    const a=await context.newPage(),b=await context.newPage();
    await a.goto(base+'/briefings/evp/#slide-1');await b.goto(base+'/briefings/technical/#slide-1');
    assert.equal(await a.locator(deckAudio).evaluate(audio=>audio.paused),true,'No arrival autoplay');
    // Headless pages stay visible: this specifically tests focus beyond visibilitychange.
    assert.equal(await a.evaluate(()=>document.hidden),false);assert.equal(await b.evaluate(()=>document.hidden),false);
    await start(a);await start(b);await paused(a);
    await start(a);await paused(b);
    // Newer ownership must survive an older, delayed message and duplicate loads.
    await a.addScriptTag({url:base+'/assets/js/narration-media.js'});
    await start(b);await paused(a);
    await a.evaluate(()=>localStorage.setItem('qe:narration-focus:/ai_qe/',JSON.stringify({type:'qe:narration-focus',id:'old-test',time:1})));
    await b.waitForTimeout(150);assert.equal(await b.locator(deckAudio).evaluate(audio=>audio.paused),false);
    // Nearly simultaneous clicks converge to one owner, never two or a restart loop.
    await Promise.all([a,b].map(page=>page.evaluate(()=>window.QENarrationMedia.play(document.querySelector('[data-narration-audio]')).catch(()=>{}))));
    await b.waitForTimeout(300);
    assert.equal((await Promise.all([a,b].map(page=>page.locator(deckAudio).evaluate(audio=>!audio.paused)))).filter(Boolean).length,1);
    await a.evaluate(()=>document.querySelector('[data-narration-audio]').pause());
    await b.evaluate(()=>document.querySelector('[data-narration-audio]').pause());
    // An ended recording has no pause event left to emit: cancel the gap explicitly.
    await enterGap(a);await start(b);await a.waitForTimeout(2300);
    assert.equal(new URL(a.url()).hash,'#slide-1','Another page cancels the pending slide advance');await paused(a);
    assert.match(await a.locator('[data-narration-status]').textContent(),/another player/);
    if(storageOnly){assert.deepEqual(errors,[]);await context.close();console.log(`${engine.name()}: storage-only cross-page handoff and auto-next cancellation passed`);continue}
    // A loading Play claims focus immediately. Cancelling it must remain cancelled
    // when network data and an old queued native play event arrive later.
    await b.evaluate(()=>document.querySelector('[data-narration-audio]').pause());await start(a);
    let release;const gate=new Promise(resolve=>{release=resolve});
    await context.route('**/assets/audio/focus-delayed.wav',async route=>{await gate;await serveWav(route)});
    await b.evaluate(url=>{
     const audio=document.createElement('audio');audio.id='delayed';audio.preload='none';audio.src=url;document.body.append(audio);
     window.QENarrationMedia.play(audio).catch(()=>{});
    },base+'/assets/audio/focus-delayed.wav');
    await paused(a);assert.equal(await b.locator('#delayed').evaluate(audio=>audio.readyState<3),true);
    await start(a);await paused(b,'#delayed');release();
    await b.waitForTimeout(250);
    await b.locator('#delayed').evaluate(audio=>audio.dispatchEvent(new Event('play')));
    await b.waitForTimeout(150);await paused(b,'#delayed');
    assert.equal(await a.locator(deckAudio).evaluate(audio=>audio.paused),false,'A cancelled request cannot reclaim focus');
    // Native media controls share focus, including when the slide is in its gap.
    await a.evaluate(()=>document.querySelector('[data-narration-audio]').pause());
    await enterGap(a);
    await a.evaluate(url=>{
     const audio=document.createElement('audio');audio.id='native';audio.controls=true;audio.src=url;document.body.append(audio);audio.play();
    },base+'/assets/audio/focus-native.wav');
    await playing(a,'#native');await a.waitForTimeout(2300);
    assert.equal(new URL(a.url()).hash,'#slide-1','Native same-page audio cancels the gap');await paused(a);
    // The actual page guide and embedded presentation hand off in both directions.
    await b.goto(base+'/case-studies/fintech/');
    const guide=b.locator('[data-narrator-guide]').first();await guide.locator('[data-guide-play]').click();
    await playing(b,'[data-guide-audio]');await paused(a,'#native');
    const iframe=b.locator('iframe').first();await iframe.scrollIntoViewIfNeeded();
    const frame=await iframe.elementHandle().then(h=>h.contentFrame());
    await start(frame);await paused(b,'[data-guide-audio]');
    await guide.locator('[data-guide-play]').click();await playing(b,'[data-guide-audio]');await paused(frame);
    // Nested frames use the same synchronous owner, not only a direct-parent message.
    await context.route('**/focus-frame*',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><script src="${base}/assets/js/narration-media.js"></script><audio id="native" controls src="${base}/assets/audio/focus-native.wav"></audio>`}));
    await b.evaluate(url=>{const f=document.createElement('iframe');f.id='focus-outer';f.src=url;document.body.append(f)},base+'/focus-frame');
    const outer=await b.locator('#focus-outer').elementHandle().then(h=>h.contentFrame());
    await outer.waitForFunction(()=>window.QENarrationMedia);
    await outer.evaluate(url=>{const f=document.createElement('iframe');f.id='focus-inner';f.src=url;document.body.append(f)},base+'/focus-frame?inner=1');
    const inner=await outer.locator('#focus-inner').elementHandle().then(h=>h.contentFrame());
    await inner.waitForFunction(()=>window.QENarrationMedia);
    await inner.locator('audio').evaluate(audio=>audio.play());await playing(inner,'audio');await paused(b,'[data-guide-audio]');
    await start(a);await paused(inner,'audio');
    assert.equal(await outer.locator('audio').evaluate(audio=>audio.paused),true,'Inactive frame stays paused');
    // Ending/closing the current owner never resumes interrupted players.
    await a.close();await b.waitForTimeout(250);await paused(inner,'audio');await paused(b,'[data-guide-audio]');await paused(frame);
    assert.deepEqual(errors,[]);await context.close();
    console.log(`${engine.name()}: cross-page, concurrent/buffered Play, stale events, duplicate initialization, native controls, same-page gap, embedded/nested frames and no automatic resumption passed`);
   }
  }finally{await browser.close()}
 }
})().catch(error=>{console.error(error);process.exit(1)});
