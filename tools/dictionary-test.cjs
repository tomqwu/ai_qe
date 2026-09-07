// Exercise lookup and cross-page navigation, including filters that hide a link target.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const {terms, categories} = JSON.parse(fs.readFileSync(path.join(root, '_data/dictionary.json')));
const architecture = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/architecture-demo.json')));
const base = (process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe').replace(/\/$/, '');
const ids = new Set(terms.map(t => t.id));
assert.equal(ids.size, terms.length, 'Dictionary IDs must be unique');
const categoryIds = new Set(categories.map(c => c.id));
for (const term of terms) {
  assert.match(term.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(categoryIds.has(term.category));
  for (const field of ['term', 'definition', 'example', 'learn']) assert.ok(term[field]?.trim(), `${term.id}: missing ${field}`);
  assert.ok(term.aliases.length && term.related.length);
  for (const id of term.related) assert.ok(ids.has(id) && id !== term.id, `${term.id}: invalid related term ${id}`);
}
const components = terms.filter(t => t.demo_node);
assert.equal(components.length, architecture.nodes.length);
assert.deepEqual(components.map(t => t.demo_node).sort(), architecture.nodes.map(n => n.id).sort());

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push({url: page.url(), stack: error.stack}));
  const proof = process.env.QE_DICTIONARY_PROOF || '/tmp/ai-qe-dictionary-proof';
  fs.mkdirSync(proof, {recursive: true});
  const visible = () => page.locator('[data-dictionary-term]:visible');
  try {
    await page.goto(`${base}/dictionary/`);
    await page.waitForSelector('[data-dictionary-controls]:visible');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await visible().count(), terms.length);
    assert.equal(await page.locator('.dictionary-term h2').count(), terms.length);
    await page.screenshot({path: path.join(proof, 'desktop.png')});
    const query = page.getByLabel('Find a term or acronym', {exact: true});
    const topic = page.getByLabel('Topic', {exact: true});
    await query.fill('RAG');
    assert.equal(await visible().count(), 1, 'Short acronyms must not match fragments of unrelated words');
    assert.equal(await visible().locator('h2').getAttribute('id'), 'rag');
    assert.ok(new URL(page.url()).searchParams.get('q') === 'RAG');
    await page.reload();
    assert.equal(await visible().count(), 1, 'Filtered URL must survive reload');
    await page.screenshot({path: path.join(proof, 'search.png')});
    await visible().locator('.dictionary-more a[href="#context-service"]').click();
    assert.equal(await visible().count(), terms.length, 'A related term hidden by search must be revealed');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'context-service');
    await page.goBack();
    assert.equal(await query.inputValue(), 'RAG', 'Back restores the shared search');
    assert.equal(await visible().count(), 1);
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dictionary-query');
    await topic.selectOption('architecture');
    assert.equal(await visible().count(), 11);
    for (const link of await page.locator('.dictionary-letters a:visible').all()) {
      const href = await link.getAttribute('href');
      assert.ok(await page.locator(href).isVisible(), 'Filtered letter index must point to a visible term');
    }
    await query.fill('zzzzno-match');
    assert.equal(await visible().count(), 0);
    assert.ok(await page.locator('[data-dictionary-empty]').isVisible());
    await query.fill('不存在');
    assert.equal(await visible().count(), 0, 'Unknown non-Latin queries must not show every term');
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    assert.equal(await topic.inputValue(), '');
    assert.equal(await visible().count(), terms.length);
    await query.fill('retrieval-augmented');
    assert.equal(await visible().count(), 1, 'Hyphenated and spaced lookup should agree');
    await page.goto(`${base}/dictionary/?topic=economics&q=savings#test-oracle`);
    assert.ok(await page.locator('#test-oracle').isVisible(), 'An incoming term anchor takes priority over conflicting filters');
    assert.equal(await query.inputValue(), '');
    assert.equal(await topic.inputValue(), '');
    for (const width of [320, 375, 768]) {
      await page.setViewportSize({width, height: 900});
      await page.goto(`${base}/dictionary/`);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Dictionary overflow at ${width}px`);
      if (width === 375) await page.screenshot({path: path.join(proof, 'mobile.png')});
      await query.fill('oracle');
      await page.locator('#dictionary-index').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 375) await page.screenshot({path: path.join(proof, 'mobile-term.png')});
    }
    const noJS = await browser.newContext({javaScriptEnabled: false, viewport: {width: 375, height: 812}});
    const staticPage = await noJS.newPage();
    await staticPage.goto(`${base}/dictionary/#test-oracle`);
    assert.equal(await staticPage.locator('[data-dictionary-term]:visible').count(), terms.length);
    assert.ok(await staticPage.locator('#test-oracle').isVisible());
    assert.ok(!await staticPage.locator('[data-dictionary-controls]').isVisible());
    await noJS.close();

    const index = await (await page.request.get(`${base}/assets/js/search-data.json`)).json();
    for (const term of terms) {
      const record = index[`dictionary-${term.id}`];
      assert.equal(record.relUrl, `/dictionary/#${term.id}`);
      for (const alias of term.aliases) assert.ok(record.content.includes(alias));
    }
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto(`${base}/docs/industry/`);
    await page.locator('#search-input').pressSequentially('RAG');
    const searchResult = page.locator('a.search-result[href$="/dictionary/#rag"]');
    await searchResult.waitFor({state: 'visible'});
    // Native blur has a null relatedTarget, as can browser chrome or navigation.
    // The theme must close search without throwing, from both focus surfaces.
    await page.locator('#search-input').evaluate(el => el.blur());
    await page.waitForFunction(() => !document.documentElement.classList.contains('search-active'));
    await page.locator('#search-input').focus();
    await searchResult.focus();
    await searchResult.evaluate(el => el.blur());
    await page.waitForFunction(() => !document.documentElement.classList.contains('search-active'));
    await page.locator('#search-input').focus();
    await page.locator('a.search-result[href$="/dictionary/#rag"]').click();
    await page.waitForSelector('#rag');
    assert.equal(new URL(page.url()).hash, '#rag', 'Site-wide acronym search opens the exact dictionary entry');
    await page.goto(`${base}/demos/architecture/?component=gateway`);
    await page.waitForFunction(() => window.qeArchitecture?.ready, {}, {timeout: 60000});
    assert.equal(await page.locator('#component-select').inputValue(), 'gateway');
    assert.equal(await page.evaluate(() => window.qeArchitecture.snapshot.playing), false);
    await page.locator('#component-select').selectOption('');
    assert.ok(!await page.locator('[data-component-definition]').isVisible());
    assert.ok(!new URL(page.url()).searchParams.has('component'));
    for (const term of components) {
      await page.locator('#component-select').selectOption(term.demo_node);
      const link = page.locator('[data-component-definition]');
      assert.equal(new URL(await link.getAttribute('href'), page.url()).hash, '#' + term.id);
      assert.ok(await link.isVisible());
      assert.equal(new URL(page.url()).searchParams.get('component'), term.demo_node);
    }
    await page.reload();
    await page.waitForFunction(() => window.qeArchitecture?.ready, {}, {timeout: 60000});
    assert.equal(await page.locator('#component-select').inputValue(), components.at(-1).demo_node);
    await page.locator('[data-scenario="evaluate"]').click();
    assert.equal(await page.locator('#component-select').inputValue(), '');
    assert.ok(!await page.locator('[data-component-definition]').isVisible(), 'Scenario change clears the previous inspector');
    await page.goto(`${base}/demos/architecture/?component=application&no3d=1`);
    await page.waitForFunction(() => document.querySelector('#architecture-demo').dataset.status === 'fallback');
    assert.equal(await page.locator('#component-select').inputValue(), 'application');
    assert.equal(await page.evaluate(() => window.qeArchitecture.snapshot.scenario), 'evaluate');
    assert.ok(await page.locator('[data-component-definition]').isVisible());

    for (const audience of ['evp', 'technical']) {
      await page.goto(`${base}/briefings/${audience}/#slide-2`);
      await page.locator('[data-notes]').click();
      const link = page.locator('.drawer-dictionary a');
      assert.ok(await link.isVisible());
      assert.equal(await link.getAttribute('href'), '/ai_qe/dictionary/');
      const popupPromise = page.waitForEvent('popup');
      await link.click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      assert.ok(popup.url().endsWith('/dictionary/'));
      await popup.close();
      assert.equal(new URL(page.url()).hash, '#slide-2', 'Looking up a term preserves the presenter’s slide');
    }
    assert.deepEqual(errors, []);
    console.log(`Passed: ${terms.length} dictionary terms, alias/topic/URL lookup, accessible anchors, mobile/no-JS reading, search index, 11 component links and both briefing decks`);
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
