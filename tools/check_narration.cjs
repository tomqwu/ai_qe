// Exercise the built player with real audio events. Fixtures stay in memory and
// are intercepted locally; no synthetic recordings are added to the publication.
const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const captions = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nFirst actual audio caption.\n\n00:00:02.000 --> 00:00:04.000\nSecond actual audio caption.\nA source line break is preserved.\n';
function audioFixture() {
  const sampleRate = 16000, samples = sampleRate * 4, pcmBytes = samples * 2;
  const buffer = Buffer.alloc(44 + pcmBytes);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + pcmBytes, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(pcmBytes, 40);
  for (let i = 0; i < samples; i++) buffer.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / sampleRate) * 100), 44 + i * 2);
  return buffer;
}
const wav = audioFixture();
const fixture = { audio:'/assets/audio/narration-test.wav', captions:'/assets/audio/narration-test.vtt', transcript:'A test narration transcript.' };
const creditedFixture = {...fixture, voice:'Test studio / Narrator', caption_method:'Word alignment from final audio'};
async function mediaPaused(page) { return page.locator('[data-narration-audio]').evaluate(audio => audio.paused); }
async function waitForPlaying(page) { await page.waitForFunction(() => { const audio = document.querySelector('[data-narration-audio]'); return audio && !audio.paused && audio.currentTime > .05; }); }
async function currentSlide(page) { return page.locator('.slide:not([hidden])').getAttribute('id'); }
async function seekNearEnd(page) { await page.locator('[data-narration-seek]').fill('3.85'); }
async function slide(page, number) { await page.locator('.deck-navigation select').selectOption(String(number - 1)); }
async function checkBounds(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => Math.ceil(document.querySelector('.narration-panel').getBoundingClientRect().height) === parseFloat(document.body.style.getPropertyValue('--narration-height')));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const bounds = await page.evaluate(() => {
    const content = document.querySelector('.slide:not([hidden])').getBoundingClientRect();
    const panel = document.querySelector('.narration-panel').getBoundingClientRect();
    const nav = document.querySelector('.deck-navigation').getBoundingClientRect();
    const flow = document.querySelector('.deck-flow-bar:not([hidden])')?.getBoundingClientRect();
    const panelElement = document.querySelector('.narration-panel');
    return { slideLeft:content.left, slideRight:content.right, panelLeft:panel.left, panelRight:panel.right,
      gap:panel.top-content.bottom, panelBottom:panel.bottom, controlsTop:flow?.top ?? nav.top,
      panelOverflow:panelElement.scrollWidth-panelElement.clientWidth, overflow:document.documentElement.scrollWidth-innerWidth };
  });
  assert.ok(Math.abs(bounds.slideLeft-bounds.panelLeft) <= 1 && Math.abs(bounds.slideRight-bounds.panelRight) <= 1, 'Audio aligns with both slide edges: '+JSON.stringify(bounds));
  assert.ok(bounds.gap >= 11 && bounds.gap <= 13, 'Consistent gap below the slide: '+JSON.stringify(bounds));
  assert.ok(bounds.panelBottom <= bounds.controlsTop + 1, JSON.stringify(bounds));
  assert.ok(bounds.panelOverflow <= 1, JSON.stringify(bounds));
  assert.ok(bounds.overflow <= 1, JSON.stringify(bounds));
}
(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch({headless:true});
    try {
      const page = await browser.newPage({viewport:{width:1280,height:720}, reducedMotion:'reduce'});
      page.setDefaultTimeout(12000);
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      let audioFails = false, captionsFail = false, emptyManifest = false, captionGate;
      await page.route('**/assets/data/narration.json*', route => route.fulfill({ json:{edition:'test-only', decks:emptyManifest ? {} : {evp:{slides:{'slide-17':creditedFixture,'slide-18':creditedFixture}},technical:{slides:{'slide-27':fixture}},'industry-evp':{slides:{'slide-1':creditedFixture,'slide-2':creditedFixture}},'industry-technical':{slides:{'slide-1':creditedFixture,'slide-2':creditedFixture}}}} }));
      await page.route('**/assets/audio/narration-test.vtt', async route => {
        if (captionGate) await captionGate;
        return route.fulfill({status:captionsFail ? 503 : 200, contentType:'text/vtt', body:captionsFail ? 'Unavailable' : captions});
      });
      await page.route('**/assets/audio/narration-test.wav', route => {
        if (audioFails) return route.fulfill({status:503, body:'Unavailable'});
        const range = route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
        const headers = {'accept-ranges':'bytes'};
        if (!range) return route.fulfill({contentType:'audio/wav',headers,body:wav});
        const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]),wav.length - 1) : wav.length - 1;
        headers['content-range'] = `bytes ${start}-${end}/${wav.length}`;
        return route.fulfill({status:206,contentType:'audio/wav',headers,body:wav.subarray(start,end + 1)});
      });
      let releaseCaptions;
      captionGate = new Promise(resolve => { releaseCaptions = resolve; });
      await page.goto(base + '/briefings/fintech-evp/#slide-18');
      await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
      assert.equal(await page.locator('[data-narration-cc]').isDisabled(),true);
      assert.match(await page.locator('[data-narration-status]').textContent(),/Loading captions/);
      assert.equal(await page.locator('[data-narration-caption]').textContent(),'');
      releaseCaptions(); captionGate = null;
      await page.locator('[data-narration-cc]:not([disabled])').waitFor();
      assert.match(await page.locator('[data-narration-status]').textContent(),/Captions synchronized/);
      await page.reload();
      await page.locator('[data-narration-cc]:not([disabled])').waitFor();
      assert.equal(await mediaPaused(page), true, 'Loading a recorded slide must not autoplay');
      await page.locator('[data-narration-auto]').uncheck();
      await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
      assert.match(await page.locator('[data-narration-caption]').textContent(), /First actual/);
      await page.locator('[data-narration-play]').click(); assert.equal(await mediaPaused(page), true);
      await page.locator('[data-narration-seek]').fill('2.5');
      await page.waitForFunction(() => document.querySelector('[data-narration-caption]').textContent.includes('Second actual'));
      assert.match(await page.locator('[data-narration-caption]').textContent(), /\nA source line break/);
      await page.locator('[data-narration-cc]').click(); assert.equal(await page.locator('[data-narration-caption]').textContent(), '');
      await page.locator('[data-narration-cc]').click();
      await page.locator('[data-narration-speed]').selectOption('1.25');
      assert.equal(await page.locator('[data-narration-audio]').evaluate(audio => audio.playbackRate),1.25);
      await seekNearEnd(page); await page.locator('[data-narration-play]').click();
      await page.waitForFunction(() => document.querySelector('[data-narration-audio]').ended);
      assert.equal(await currentSlide(page),'slide-18','Auto-next unchecked must keep the completed slide');
      await page.locator('[data-narration-replay]').click(); await waitForPlaying(page);
      assert.ok(await page.locator('[data-narration-audio]').evaluate(audio => audio.currentTime < 1),'Replay starts this recording again');
      await page.locator('[data-narration-transcript]').click();
      assert.equal(await mediaPaused(page),true);
      assert.match(await page.locator('.narration-transcript-dialog').textContent(),/A test narration transcript/);
      assert.equal(await page.locator('.narration-provenance').textContent(),'Audio narration · English\nEnglish captions synchronized to the recording.');
      await page.keyboard.press('ArrowRight'); assert.equal(await currentSlide(page),'slide-18');
      await page.keyboard.press('Escape');
      await page.locator('[data-reading]').click(); assert.equal(await page.locator('.narration-panel').isVisible(),false);
      assert.equal(await mediaPaused(page),true);
      await page.locator('[data-reading]').click(); await slide(page,18);
      await page.locator('[data-narration-play]').waitFor(); assert.equal(await mediaPaused(page),true);

      // Notes must stay attached to the visible slide while recorded audio is paused.
      for (const selector of ['[data-notes]','[data-edition]']) {
        await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
        await page.locator(selector).click();
        assert.equal(await page.locator('.deck-drawer').isVisible(),true);
        assert.equal(await mediaPaused(page),true,'Opening a slide drawer must pause narration');
        assert.equal(await currentSlide(page),'slide-18');
        await page.locator('[data-close-drawer]').click();
        assert.equal(await mediaPaused(page),true,'Closing notes must not automatically resume narration');
      }

      // An actual ended event advances once, and never skips an unrecorded slide.
      await page.locator('[data-narration-auto]').check();
      await page.locator('[data-narration-play]').click(); await waitForPlaying(page); await seekNearEnd(page);
      await page.waitForURL(/#slide-19$/);
      assert.equal(await page.locator('.narration-panel').isVisible(),false);
      assert.match(await page.locator('.deck-message').textContent(),/Narration paused/);
      await slide(page,17); await page.locator('[data-narration-play]').click(); await waitForPlaying(page); await seekNearEnd(page);
      await page.waitForFunction(() => document.querySelector('.narration-panel').dataset.narrationState === 'between-slides');
      const gapStart = Date.now();
      assert.equal(await currentSlide(page),'slide-17','Keep the completed slide visible during the pause');
      assert.match(await page.locator('[data-narration-start]').textContent(),/Pause narration/);
      await page.waitForURL(/#slide-18$/); await waitForPlaying(page);
      assert.ok(Date.now() - gapStart >= 1800,'Pause between slides is about two wall-clock seconds even at 1.25x');
      await page.locator('[data-narration-play]').click();
      await checkBounds(page);

      // Pause, manual navigation, notes and Auto-next off must cancel delayed navigation.
      const enterGap = async () => {
        await slide(page,17); await page.locator('[data-narration-auto]').check();
        await page.locator('[data-narration-play]').click(); await waitForPlaying(page); await seekNearEnd(page);
        await page.waitForFunction(() => document.querySelector('.narration-panel').dataset.narrationState === 'between-slides');
      };
      await enterGap(); await page.locator('[data-narration-start]').click();
      await page.waitForTimeout(2200);
      assert.equal(await currentSlide(page),'slide-17','Pause holds the slide past the pending timer');
      await page.locator('[data-narration-start]').click();
      await page.waitForURL(/#slide-18$/); await waitForPlaying(page);
      await page.locator('[data-narration-play]').click();
      for (const action of ['navigate','notes','auto-off']) {
        await enterGap();
        if (action==='navigate') await slide(page,18);
        if (action==='notes') await page.locator('[data-notes]').click();
        if (action==='auto-off') await page.locator('[data-narration-auto]').uncheck();
        await page.waitForTimeout(2200);
        assert.equal(await currentSlide(page),action==='navigate'?'slide-18':'slide-17',`${action} cancels the delayed change`);
        assert.equal(await mediaPaused(page),true);
        if (action==='notes') {
          assert.match(await page.locator('[data-drawer-content] .slide-narrator-notes').textContent(),/A test narration transcript/);
          await page.locator('[data-close-drawer]').click();
        }
      }
      await page.locator('[data-narration-auto]').check();
      await slide(page,17); await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
      await slide(page,18); assert.equal(await mediaPaused(page),true,'Manual navigation must stop playback');
      assert.equal(await page.locator('[data-narration-caption]').textContent(),'');

      await page.goto(base + '/briefings/fintech-evp/?route=client#slide-17');
      await page.locator('[data-narration-play]').click(); await waitForPlaying(page); await seekNearEnd(page);
      await page.waitForURL(/#slide-5$/); // The guided route differs from numerical order.
      assert.equal(await page.locator('.narration-panel').isVisible(),false);

      captionsFail = true;
      await page.goto(base + '/briefings/fintech-evp/#slide-18');
      await page.locator('[data-narration-retry-captions]').waitFor();
      assert.match(await page.locator('[data-narration-status]').textContent(),/captions could not load/);
      await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
      captionsFail = false; await page.locator('[data-narration-retry-captions]').click();
      await page.locator('[data-narration-cc]:not([disabled])').waitFor();
      await page.locator('[data-narration-play]').click();
      audioFails = true;
      await page.reload();
      await page.waitForFunction(() => document.querySelector('.narration-panel')?.dataset.narrationState === 'error');
      assert.match(await page.locator('[data-narration-status]').textContent(),/Audio could not load/);
      audioFails = false; await page.locator('[data-narration-play]').click(); await waitForPlaying(page);
      await page.locator('[data-narration-play]').click();

      await page.goto(base + '/briefings/fintech-technical/#slide-27');
      await page.locator('[data-narration-play]').waitFor(); await checkBounds(page);
      await page.locator('[data-narration-transcript]').click();
      assert.equal(await page.locator('.narration-provenance').count(),0,'Missing optional provenance must not invent a provider or caption method');
      await page.keyboard.press('Escape');
      for (const width of [320,375,700]) {
        await page.setViewportSize({width,height:812});
        await page.locator('[data-narration-play]').scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),`Mobile overflow at ${width}`);
        assert.ok(await page.locator('[data-narration-play]').isVisible());
      }
      // The prominent presentation control also works in both industry decks.
      for (const audience of ['evp', 'technical']) {
        await page.setViewportSize({width:1280,height:900});
        await page.goto(base + `/briefings/${audience}/#slide-1`);
        const start = page.locator('[data-narration-start]');
        await start.waitFor();
        assert.equal(await mediaPaused(page),true,'A deck never starts speech without a click');
        await start.click(); await waitForPlaying(page);
        assert.match(await start.textContent(),/Pause narration/);
        await start.click(); assert.equal(await mediaPaused(page),true);
        await page.locator('[data-reading]').click();
        await start.click(); await waitForPlaying(page);
        assert.equal(await page.locator('body').getAttribute('data-deck-mode'),'slides');
        assert.equal(await page.locator('[data-narration-auto]').isChecked(),true);
        await seekNearEnd(page); await page.waitForURL(/#slide-2$/); await waitForPlaying(page);
        await start.click();
        await checkBounds(page);
        // Cover the former 1200px cap, tall windows and short presentation frames.
        for (const viewport of [{width:1920,height:1080},{width:2560,height:1600},{width:900,height:1400},{width:1024,height:500}]) {
          await page.setViewportSize(viewport); await checkBounds(page);
        }
        await page.setViewportSize({width:1280,height:900});
        await page.locator('[data-fullscreen]').click(); await checkBounds(page);
        await page.locator('[data-fullscreen]').click(); await checkBounds(page);
        for (const width of [320,375,700]) {
          await page.setViewportSize({width,height:812});
          assert.ok(await start.isVisible(),'Play narration remains in the mobile menu');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),`Header overflow at ${width}`);
        }
      }
      // Use the real host page and its embedded technical deck, including flow controls.
      await page.setViewportSize({width:1920,height:1080});
      await page.goto(base + '/');
      await page.locator('[data-visual-audience="technical"]').first().click();
      const embedded = await page.locator('#briefing-frame').elementHandle().then(handle => handle.contentFrame());
      await embedded.waitForURL(url => url.pathname.endsWith('/briefings/technical/') && url.hash === '#slide-2', {waitUntil:'domcontentloaded'});
      await embedded.locator('[data-narration-play]').waitFor();
      await checkBounds(embedded);
      await page.emulateMedia({media:'print'});
      assert.equal(await embedded.locator('.narration-panel').isVisible(),false);
      await page.emulateMedia({media:'screen'});
      emptyManifest = true;
      await page.goto(base + '/briefings/fintech-evp/#slide-18');
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.narration-panel').count(),0,'No empty player for slides without recordings');
      const nojs = await browser.newPage({javaScriptEnabled:false});
      await nojs.goto(base + '/briefings/fintech-evp/#slide-18');
      assert.equal(await nojs.locator('.narration-panel').count(),0);
      assert.ok(await nojs.locator('#slide-18').isVisible()); await nojs.close();
      assert.deepEqual(errors,[]);
      console.log(`Passed ${engine.name()}: recorded audio, exact VTT cues, seek/CC/speed, replay sequence, manual navigation, reading mode, transcript, recoverable errors, responsive layout and optional/no-JS/print behavior.`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exit(1); });
