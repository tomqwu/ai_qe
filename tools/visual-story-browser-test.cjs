const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const adoption = require('../_data/adoption.json');
const story = require('../_data/visual_story.json');
const {assess} = require('../assets/js/readiness-model.js');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';
(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}), errors=[];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/case-studies/fintech/evidence/?pilot=triage#dependencies');
      for (const scope of ['pilot','scale']) for (const workflow of adoption.workflows) {
        await page.locator('[data-vs-workflow]').selectOption(workflow.id);
        await page.locator('[data-vs-scope]').selectOption(scope);
        const expected = assess(adoption, workflow.id, scope, {});
        assert.deepEqual(await page.locator('[data-vs-requirement]').evaluateAll(items => items.map(item => item.dataset.vsRequirement)), expected.requirements.map(d => d.id));
        assert.match(await page.locator('[data-vs-map-summary]').textContent(), /all unverified/);
        const href = new URL(await page.locator('[data-vs-assess]').getAttribute('href'));
        assert.equal(href.searchParams.get('workflow'), workflow.id); assert.equal(href.searchParams.get('scope'), scope);
        assert.equal(href.searchParams.get('preset'), 'unknown');
        assert.equal(new URL(page.url()).searchParams.get('pilot'), 'triage', 'Map interactions retain the selected trial');
      }
      await page.locator('[data-vs-requirement="evidence"]').click();
      assert.ok((await page.locator('[data-vs-proof]').textContent()).includes(adoption.dependencies.find(d => d.id === 'evidence').evidence));
      await page.locator('[data-vs-workflow]').selectOption('diagnosis'); await page.reload();
      assert.equal(await page.locator('[data-vs-workflow]').inputValue(), 'diagnosis');
      assert.equal(await page.locator('[data-vs-requirement="infra"]').count(), 0);
      await page.locator('[data-vs-workflow]').selectOption('triage'); assert.equal(await page.locator('[data-vs-requirement="infra"]').count(), 1);
      await page.goto(base + '/case-studies/fintech/implementation/#sample-automation');
      assert.ok(await page.locator('#sample-automation').isVisible());
      for (const artifact of story.artifacts) {
        await page.locator('[data-vs-artifact-select]').selectOption(artifact.id);
        assert.equal(await page.locator('[data-vs-artifact]:visible').count(), 1);
        assert.ok((await page.locator('[data-vs-artifact]:visible code').textContent()).includes(artifact.content));
        await page.reload(); assert.ok(await page.locator('#sample-' + artifact.id).isVisible());
      }
      assert.ok(await page.locator('[data-vs-artifact-next]').isDisabled());
      await page.goto(base + '/qe-modernization/#environment');
      const life = page.locator('[data-vs-lifecycle]');
      await life.locator('[data-vs-life-outcome]').selectOption('setup-failure');
      for (const expected of [0,3,4,5]) { await life.locator('[data-vs-life-next]').click(); assert.equal(await life.locator('[data-vs-life-step]').evaluateAll(steps => steps.findIndex(s => s.classList.contains('vs-current'))), expected); }
      assert.match(await life.locator('[data-vs-life-status]').textContent(), /execution is skipped.*cleanup.*Release held/);
      assert.ok(await life.locator('[data-vs-life-next]').isDisabled());
      await life.locator('[data-vs-life-outcome]').selectOption('test-failure');
      for (let i=0;i<6;i++) await life.locator('[data-vs-life-next]').click();
      assert.match(await life.locator('[data-vs-life-status]').textContent(), /Payment assertion failed.*Release held/);
      await life.locator('[data-vs-life-reset]').click(); assert.equal(await life.locator('.vs-current').count(), 0);
      for (const [audience, route] of Object.entries(story.routes)) {
        await page.goto(`${base}/briefings/fintech-${audience}/?route=client#slide-1`);
        for (let i=0;i<route.length;i++) {
          assert.equal(await page.locator('.slide:not([hidden])').getAttribute('id'), 'slide-' + route[i]);
          assert.match(await page.locator('.slide-status').textContent(), new RegExp(`Story ${i+1}/${route.length}`));
          if (i<route.length-1) await page.locator('[data-next]').click();
        }
        assert.ok(await page.locator('[data-next]').isDisabled());
        await page.locator('[data-previous]').click(); assert.equal(new URL(page.url()).hash, '#slide-' + route.at(-2));
        await page.reload(); assert.equal(await page.locator('[data-guided-route]').getAttribute('aria-pressed'), 'true');
        await page.locator('[data-guided-route]').click(); assert.equal(new URL(page.url()).searchParams.has('route'), false);
        await page.locator('.deck-navigation select').selectOption('1'); assert.equal(new URL(page.url()).hash, '#slide-2');
        await page.locator('[data-reading]').click(); assert.equal(await page.locator('.slide:visible').count(), require('../_data/fintech_decks.json')[audience].length);
      }
      for (const path of ['/case-studies/fintech/evidence/#dependencies','/case-studies/fintech/implementation/#stack','/case-studies/fintech/#workflow-automation','/qe-modernization/#environment','/briefings/#guided-routes']) {
        for (const width of [390,768,1440]) {await page.setViewportSize({width,height:1000});await page.goto(base + path);assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine.name()} ${path}/${width}: page overflow`);}
      }
      const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
      await nojs.goto(base + '/case-studies/fintech/implementation/');assert.equal(await nojs.locator('[data-vs-artifact]:visible').count(), 8);
      await nojs.goto(base + '/qe-modernization/');assert.equal(await nojs.locator('[data-vs-life-step]:visible').count(), 6);
      assert.deepEqual(errors, []);
      console.log(`Passed: ${engine.name()} canonical dependency rules, diagnostic scope, artifact deep links, failure/cleanup paths, guided routes, mobile and no-JS reading`);
    } finally { await browser.close(); }
  }
})().catch(e => {console.error(e); process.exitCode=1;});
