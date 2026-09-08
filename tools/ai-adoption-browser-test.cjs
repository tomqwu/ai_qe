// Follow the leadership roadmap through real selection, history and prerequisite links.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';
(async () => {
  let checks = 0;
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch({headless:true});
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + '/ai-adoption/');
      assert.equal(await page.locator('[data-al-detail]:visible').count(), 1);
      for (const [id,word] of [['copilot','GitHub Copilot Chat'],['workflow','cannot edit tests'],['agent','Attempt, time and spend limits'],['platform','wider distribution does not grant wider authority']]) {
        await page.locator(`[data-al-select="${id}"]`).click();
        assert.equal(new URL(page.url()).hash, '#layer-' + id);
        assert.equal(await page.locator('[data-al-detail]:visible').count(), 1);
        assert.equal(await page.locator('[data-al-select][aria-current="true"]').count(), 1);
        assert.match(await page.locator('[data-al-detail]:visible').textContent(), new RegExp(word));
        await page.reload();
        assert.ok(await page.locator('#layer-' + id).isVisible());
        checks++;
      }
      await page.locator('[data-al-select="workflow"]').focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('#layer-workflow').isVisible());
      await page.locator('[data-al-select="agent"]').click();
      await page.goBack();
      assert.ok(await page.locator('#layer-workflow').isVisible());
      await page.goForward();
      assert.ok(await page.locator('#layer-agent').isVisible());
      await page.locator('[data-al-all]').click();
      assert.equal(await page.locator('[data-al-detail]:visible').count(), 4);
      assert.equal(await page.locator('[data-al-select][aria-current="true"]').count(), 0);
      await page.reload();
      assert.equal(await page.locator('[data-al-detail]:visible').count(), 4);
      for (const [id,workflow,scope] of [['copilot','design','pilot'],['workflow','diagnosis','pilot'],['agent','automation','pilot'],['platform','automation','scale']]) {
        await page.goto(base + '/ai-adoption/#layer-' + id);
        await page.locator(`#layer-${id} a[href*="/platform-readiness/"]`).click();
        assert.equal(new URL(page.url()).searchParams.get('workflow'), workflow);
        assert.equal(await page.locator('#readiness-workflow').inputValue(), workflow);
        assert.equal(await page.locator('#readiness-scope').inputValue(), scope);
        assert.equal(await page.locator('#readiness-preset').inputValue(), 'unknown');
        checks++;
      }
      for (const width of [320,390,768,1280,1920]) {
        await page.setViewportSize({width,height:1000});
        await page.goto(base + '/ai-adoption/#all-layers');
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`);
        if (width < 800) await page.locator('#conversation-menu').click();
        assert.equal(await page.locator('#conversation-nav a[aria-current="page"]').count(), 1);
        assert.match(await page.locator('#conversation-nav a[aria-current="page"]').textContent(), /AI adoption roadmap/);
        checks++;
      }
      await page.setViewportSize({width:1440,height:1000});
      await page.goto(base + '/');
      await page.locator('#search-input').fill('Four layers of AI-assisted QE');
      const result = page.locator('.search-result[href*="/briefings/fintech-evp/#slide-17"]').first();
      await result.waitFor({state:'visible'});
      await result.locator('.search-result-title').click();
      assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'), 'slide-17');
      await page.goto(base + '/briefings/fintech-technical/#slide-28');
      assert.equal(await page.locator('#slide-28 .al-path').count(), 4);
      assert.match(await page.locator('#slide-28').textContent(), /not four consecutive runtime steps/);
      const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
      await nojs.goto(base + '/ai-adoption/');
      assert.equal(await nojs.locator('[data-al-detail]:visible').count(), 4);
      await nojs.locator('[data-al-select="agent"]').click();
      assert.equal(new URL(nojs.url()).hash, '#layer-agent');
      await nojs.close();
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.goto(base + '/ai-adoption/#layer-workflow');
      await page.locator('[data-al-select="agent"]').click();
      assert.ok(await page.locator('#layer-agent').isVisible());
      assert.deepEqual(errors, []);
      await page.close();
    } finally { await browser.close(); }
  }
  console.log(`Passed: ${checks} adoption layer/viewport/prerequisite checks, history, keyboard selection, deep links, search-to-slide navigation, architecture paths, reduced motion and no-JS reading in Chromium and WebKit`);
})().catch(error => { console.error(error); process.exit(1); });
