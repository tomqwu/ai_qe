// All static results are produced by the same arithmetic used in the browser.
const fs = require('node:fs');
const {presets, calculate} = require('../assets/js/qe-model.js');
const output = Object.fromEntries(Object.entries(presets).map(([key, p]) => [key, {...p, ...calculate(p)}]));
const path = require('node:path').join(__dirname, '../_data/scenario_results.json');
const content = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(path, 'utf8') !== content) throw new Error('Scenario results are stale: run node tools/build_scenario_data.cjs');
} else fs.writeFileSync(path, content);
