// Verify in-place diagram guides, complete slide notes and shared audio focus.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const routes = ['', 'ai-adoption/', 'qe-modernization/', 'dictionary/', 'platform-readiness/',
  'case-studies/fintech/', 'case-studies/fintech/evidence/', 'case-studies/fintech/implementation/',
  'docs/industry/', 'docs/industry/operating-model/', 'docs/industry/evidence/',
  'docs/industry/architecture/', 'docs/industry/strategic-choices/', 'docs/industry/reference-contracts/',
  'docs/industry/coverage/', 'docs/industry/outlook/'];
async function playing(audio) { await audio.page().waitForFunction(a => !a.paused && a.currentTime > .3, await audio.elementHandle()); }
(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      page.setDefaultTimeout(15000);
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      let requestedAudio=0;
      const cache=new Map();
      await page.route('**/assets/audio/**/*.mp3',async route=>{
        if (route.request().frame() === page.mainFrame()) requestedAudio++;
        const url=route.request().url();
        if(!cache.has(url)) { const headers={...route.request().headers()};delete headers.range;const response=await route.fetch({headers});assert.ok(response.ok());cache.set(url,await response.body()); }
        const bytes=cache.get(url),match=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/),headers={'accept-ranges':'bytes'};
        if(!match)return route.fulfill({contentType:'audio/mpeg',headers,body:bytes});
        const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;
        headers['content-range']=`bytes ${start}-${end}/${bytes.length}`;
        return route.fulfill({status:206,contentType:'audio/mpeg',headers,body:bytes.subarray(start,end+1)});
      });
      for(const route of routes){
        await page.goto(base+'/'+route);
        await page.locator('[data-narrator-guide]').first().waitFor({state:'attached'});
        const missing=await page.locator('main figure').evaluateAll(figures=>figures.filter(figure=>{
          if(figure.matches('.hero-art'))return false;
          if(figure.nextElementSibling?.matches('[data-narrator-guide]'))return false;
          if(figure.closest('.value-explorer')?.nextElementSibling?.matches('[data-narrator-guide]'))return false;
          return true;
        }).map(f=>f.className));
        assert.deepEqual(missing,[],route+' has an unexplained visual');
        assert.equal(await page.locator('[data-guide-audio]').evaluateAll(a=>a.some(x=>!x.paused)),false,'Never autoplay a page explanation');
        assert.doesNotMatch(await page.locator('body').innerText(), /\bChris\b/, 'Public narration uses neutral audio labels');
      }
      assert.equal(requestedAudio,0,'Collapsed in-place guides do not download MP3 files');
      for(const [route,count] of [['fintech-evp',19],['fintech-technical',30],['evp',25],['technical',35]]){
        await page.goto(base+`/briefings/${route}/`);
        await page.waitForFunction(n=>document.querySelectorAll('.slide-narrator-notes').length===n,count);
        assert.equal(await page.locator('[data-narrator-guide]').count(),0,'No duplicate page player inside slides');
        await page.locator('[data-notes]').click();
        assert.ok((await page.locator('[data-drawer-content] .slide-narrator-notes').textContent()).length>120);
        await page.locator('[data-close-drawer]').click();
      }
      await page.goto(base+'/case-studies/fintech/');
      const guides=page.locator('[data-narrator-guide]'); await guides.first().waitFor();
      const first=guides.first(),second=guides.nth(1);
      await first.locator('[data-guide-play]').click(); await playing(first.locator('audio'));
      await page.waitForFunction(()=>document.querySelector('[data-guide-caption]').textContent.trim().length>0);
      await first.locator('summary').click();
      assert.match(await first.locator('details').textContent(),/Spoken explanation/);
      await second.locator('[data-guide-play]').click();await playing(second.locator('audio'));
      assert.equal(await first.locator('audio').evaluate(a=>a.paused),true,'Only one explanation plays');
      await second.locator('select').selectOption('1.25');
      assert.equal(await second.locator('audio').evaluate(a=>a.playbackRate),1.25);
      await second.locator('[aria-label="English subtitles"][aria-pressed]').click();
      assert.equal(await second.locator('[data-guide-caption]').textContent(),'');
      await second.locator('[data-guide-play]').click();
      for(const width of [320,390,700]){
        await page.setViewportSize({width,height:844});
        await first.scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),'In-place notes fit mobile');
      }
      await page.setViewportSize({width:1440,height:1000});
      // Embedded slides and the surrounding page must share audio focus.
      const iframe=page.locator('iframe').first(); await iframe.scrollIntoViewIfNeeded();
      const frame=await iframe.elementHandle().then(h=>h.contentFrame());
      await frame.locator('[data-narration-start]').waitFor();
      await first.locator('[data-guide-play]').click();await playing(first.locator('audio'));
      await frame.locator('[data-narration-start]').click();
      await playing(frame.locator('[data-narration-audio]'));
      assert.equal(await first.locator('audio').evaluate(a=>a.paused),true,'Starting a deck pauses the page explanation');
      await first.locator('[data-guide-play]').click();await playing(first.locator('audio'));
      await page.waitForTimeout(150);
      assert.equal(await frame.locator('[data-narration-audio]').evaluate(a=>a.paused),true,'Starting a page explanation pauses the embedded deck');
      await page.goto(base+'/demos/architecture/?scenario=deny');
      await page.waitForFunction(()=>window.qeArchitecture?.snapshot.scenario);
      await page.locator('[data-narrator-guide="industry-technical/slide-16"]').waitFor();
      for(const [scenario,slide] of [['generate',3],['evaluate',5],['deny',16],['hold',18]]){
        await page.locator(`[data-scenario="${scenario}"]`).click();
        const guide=page.locator(`[data-narrator-guide="industry-technical/slide-${slide}"]`);await guide.waitFor();
        assert.equal(await page.locator('[data-guide-audio]').count(),1);
        await guide.locator('[data-guide-play]').click();await playing(guide.locator('audio'));
        await page.waitForFunction(()=>window.qeArchitecture.snapshot.synced);
        assert.equal(await page.evaluate(()=>window.qeArchitecture.snapshot.clock),'audio','Narration owns the 3D story clock');
        // On slower graphics runners, audio may have crossed its first section
        // while Playwright scrolled the controls into view. Seek a known origin.
        await guide.locator('audio').evaluate(a=>{a.pause();a.currentTime=0});
        await page.waitForFunction(()=>{const a=document.querySelector('[data-guide-audio]');return !a.seeking&&a.currentTime<.01&&window.qeArchitecture.snapshot.stage===0});
        await page.locator('[data-next]').click();
        assert.equal(await guide.locator('audio').evaluate(a=>a.paused),true,'Inspecting another audio section pauses the recording');
        await page.waitForFunction(()=>window.qeArchitecture.snapshot.stage===1).catch(async error=>{console.error('Section seek diagnostic',scenario,await page.evaluate(()=>({snapshot:window.qeArchitecture.snapshot,audioTime:document.querySelector('[data-guide-audio]').currentTime,seeking:document.querySelector('[data-guide-audio]').seeking})));throw error});
      }
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('[data-narrator-guide]').isVisible(),false);
      assert.deepEqual(errors,[]);
      console.log(`${engine.name()}: all 109 slide notes; diagram coverage on 16 existing pages; actual recorded audio/captions, lazy loading, audio focus, mobile and four architecture scenarios passed`);
    }finally{await browser.close();}
  }
})().catch(error=>{console.error(error);process.exit(1);});
