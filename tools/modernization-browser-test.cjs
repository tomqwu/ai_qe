const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const data = require('../_data/modernization.json');
const base = process.env.QE_TEST_URL || 'http://127.0.0.1:61600/ai_qe';
(async () => {
  const ids = new Set(data.sources.map(source => source.id));
  assert.equal(ids.size, data.sources.length);
  for (const record of [...data.workstreams, ...data.surfaces]) for (const id of record.sources) assert.ok(ids.has(id));
  assert.deepEqual(require('../assets/data/qe-modernization-sources.json'), data.sources);
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base+'/qe-modernization/');
      assert.equal(await page.locator('.mod-workstream').count(), data.workstreams.length);
      assert.equal(await page.locator('.mod-evidence article').count(), data.sources.length);
      assert.equal(await page.locator('#conversation-nav [aria-current="page"]').count(), 1);
      for (const surface of data.surfaces) {
        await page.locator('[data-mod-surface-select]').selectOption(surface.id);
        assert.equal(await page.locator('[data-mod-surface]:visible').count(), 1);
        assert.equal(new URL(page.url()).searchParams.get('surface'), surface.id);
        await page.reload();
        assert.ok(await page.locator(`#surface-${surface.id}`).isVisible());
      }
      await page.goto(base+'/qe-modernization/?surface=invalid');
      assert.equal(await page.locator('[data-mod-surface-select]').inputValue(), 'api');
      const json = await page.request.get(base+'/assets/data/qe-modernization-sources.json');
      assert.deepEqual(await json.json(), data.sources);
      const csv = await page.request.get(base+'/assets/data/qe-modernization-sources.csv');
      const csvText=await csv.text(); for (const source of data.sources) assert.ok(csvText.includes(source.url));
      const figure = page.locator('.mod-environment');
      await figure.scrollIntoViewIfNeeded();
      assert.ok(await figure.locator('.diagram-overview').isHidden());
      await figure.getByRole('button',{name:'Readable overview',exact:true}).click();
      assert.equal(await figure.locator('.diagram-overview li strong').count(),6);
      assert.ok((await figure.locator('.diagram-overview').textContent()).includes('Payment application'));
      await figure.getByRole('button',{name:'Detailed diagram',exact:true}).click();
      const routes = await figure.locator('path.edge').evaluateAll(edges => edges.map(edge => edge.dataset.from+':'+edge.dataset.to));
      assert.deepEqual([...new Set(data.flow.flatMap(step=>step.routes))].sort(), routes.sort());
      await figure.locator('[data-tour-reset]').click();
      await figure.locator('[data-tour-play]').click();
      const packet=figure.locator('.flow-effect.route-focus .flow-packet').first();
      await packet.waitFor({state:'visible'});
      const before=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));
      await page.waitForTimeout(250);
      const after=await packet.evaluate(el=>({x:el.getCTM().e,y:el.getCTM().f}));
      assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>1,'The displayed packet moves');
      await figure.locator('[data-tour-play]').click();
      const clock=await figure.locator('svg').evaluate(el=>el.getCurrentTime());
      await page.waitForTimeout(150);
      assert.ok(Math.abs(await figure.locator('svg').evaluate(el=>el.getCurrentTime())-clock)<.03,'Pause stops the SVG clock');
      await page.emulateMedia({reducedMotion:'reduce'});
      await figure.locator('[data-tour-reset]').click();
      await figure.locator('[data-tour-next]').click();
      assert.ok(await figure.locator('[data-tour-play]').isDisabled());
      assert.match(await figure.locator('[data-tour-status]').textContent(), /pinned test run/);
      for (const width of [320,390,768,1024,1440,2560]) {
        await page.setViewportSize({width,height:1000});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${engine.name()}/${width}: overflow`);
      }
      await page.setViewportSize({width:1440,height:1000});
      await page.goto(base+'/');
      await page.locator('#search-input').fill('containerization');
      await page.locator('.search-result[href$="/qe-modernization/#workstream-environments"]').click();
      await page.waitForURL('**/qe-modernization/**#workstream-environments');
      const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
      await nojs.goto(base+'/qe-modernization/');
      assert.equal(await nojs.locator('[data-mod-surface]:visible').count(), data.surfaces.length);
      assert.equal(await nojs.locator('.mod-workstream:visible').count(), data.workstreams.length);
      assert.deepEqual(errors,[]);
      console.log(`Passed: ${engine.name()} modernization source exports, surface sharing, five directed animated routes, pause/reduced motion, search, six widths and no-JS access`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exitCode=1; });
