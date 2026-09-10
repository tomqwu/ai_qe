// Validate shipped MP3s and captions in each audience deck. No synthetic audio.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const routes = [['fintech-evp','evp'],['fintech-technical','technical'],['evp','industry-evp'],['technical','industry-technical']];

async function playing(page) {
  await page.waitForFunction(() => {
    const audio = document.querySelector('[data-narration-audio]');
    return audio && !audio.paused && audio.currentTime > .7;
  });
}
async function nearEnd(page) {
  const duration = await page.locator('[data-narration-audio]').evaluate(a => a.duration);
  const target = Math.floor(duration) - 1;
  await page.locator('[data-narration-seek]').fill(String(target));
  await page.waitForFunction(target => {
    const audio = document.querySelector('[data-narration-audio]');
    return !audio.seeking && audio.currentTime >= target - .2;
  }, target);
}
async function advanced(page, id) {
  try {
    // Observe the visible slide and document hash together, independently of
    // automation lifecycle notifications for same-document history changes.
    await page.waitForFunction(id => location.hash === `#${id}` &&
      document.querySelector('.slide:not([hidden])')?.id === id, id);
  } catch (error) {
    const state = await page.evaluate(() => {
      const audio = document.querySelector('[data-narration-audio]');
      return {url:location.href, hidden:document.hidden, slide:window.QEDeck.getState(),
        status:document.querySelector('[data-narration-status]').textContent,
        currentTime:audio.currentTime, duration:audio.duration, paused:audio.paused,
        ended:audio.ended, seeking:audio.seeking, readyState:audio.readyState,
        error:audio.error?.message};
    });
    throw new Error(`Narration did not advance to ${id}: ${JSON.stringify(state)}; ${error.message}`);
  }
}

(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch({headless:true});
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      page.setDefaultTimeout(15000);
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      const response = await page.request.get(base + '/assets/data/narration.json');
      assert.ok(response.ok());
      const manifest = await response.json();
      assert.equal(manifest.complete, true);
      // The local static server does not implement byte ranges. Supply ranges
      // from its actual downloaded MP3 to exercise WebKit seeking as on Pages.
      const audioCache = new Map();
      await page.route('**/assets/audio/**/*.mp3', async route => {
        const url = route.request().url();
        if (!audioCache.has(url)) {
          const headers = {...route.request().headers()}; delete headers.range;
          const actual = await route.fetch({headers});
          assert.ok(actual.ok(), `Missing actual MP3: ${url}`);
          audioCache.set(url, await actual.body());
        }
        const bytes = audioCache.get(url), match = route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
        const headers = {'accept-ranges':'bytes'};
        if (!match) return route.fulfill({contentType:'audio/mpeg', headers, body:bytes});
        const start = Number(match[1]), end = match[2] ? Math.min(Number(match[2]),bytes.length-1) : bytes.length-1;
        headers['content-range'] = `bytes ${start}-${end}/${bytes.length}`;
        return route.fulfill({status:206, contentType:'audio/mpeg', headers, body:bytes.subarray(start,end+1)});
      });
      for (const [route,key] of routes) {
        await page.goto(`${base}/briefings/${route}/#slide-1`);
        await page.locator('[data-narration-cc]:not([disabled])').waitFor({state:'attached'});
        assert.equal(await page.locator('[data-narration-audio]').evaluate(a=>a.paused), true);
        await page.locator('[data-narration-start]').click(); await playing(page);
        assert.ok((await page.locator('[data-narration-caption]').textContent()).trim());
        const actualDuration = await page.locator('[data-narration-audio]').evaluate(a=>a.duration);
        assert.ok(Math.abs(actualDuration-manifest.decks[key].slides['slide-1'].duration)<.2);
        await nearEnd(page); await advanced(page, 'slide-2'); await playing(page);
        await page.locator('[data-narration-start]').click();
        assert.equal(await page.locator('[data-narration-audio]').evaluate(a=>a.paused), true);
        await page.locator('[data-narration-transcript]').click();
        assert.match(await page.locator('.narration-provenance').textContent(), /Audio narration · English/);
        assert.doesNotMatch(await page.locator('.narration-transcript-dialog').textContent(), /Chris|ElevenLabs/);
        await page.keyboard.press('Escape');
        await page.setViewportSize({width:390,height:844});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1));
        await page.setViewportSize({width:1440,height:1000});
        console.log(`${engine.name()} ${route}: shipped audio, timed captions, header controls and auto-next passed`);
      }
      await page.goto(base+'/briefings/fintech-technical/?route=client#slide-26');
      await page.locator('[data-narration-start]').click(); await playing(page);
      await nearEnd(page); await advanced(page, 'slide-27'); await playing(page);
      await page.goto(base+'/briefings/fintech-evp/#slide-12');
      await page.locator('[data-narration-start]').click(); await playing(page);
      await nearEnd(page);
      await page.waitForFunction(()=>document.querySelector('[data-narration-audio]').ended &&
        document.querySelector('[data-narration-start]').getAttribute('aria-pressed') === 'false');
      assert.match(page.url(), /#slide-12$/);
      assert.equal(await page.locator('[data-narration-start]').getAttribute('aria-pressed'),'false');
      assert.deepEqual(errors,[]);
      console.log(`${engine.name()}: guided-route order and final-slide stop passed`);
    } finally { await browser.close(); }
  }
})().catch(error => {console.error(error); process.exit(1);});
