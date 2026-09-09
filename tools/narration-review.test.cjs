const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {semantic,digest,problems}=require('./narration-review.cjs');
test('content and diagram changes invalidate review while layout changes do not',async()=>{
 const browser=await chromium.launch();
 try {
  const page=await browser.newPage({javaScriptEnabled:false});
  const hash=async html=>{await page.setContent(html);return digest(await page.locator('section').evaluate(semantic));};
  const base='<section><h2>One transfer</h2><svg><g data-flow-node="test"><text>Check balances</text></g><path data-from="test" data-to="release" d="M0 0L10 10"/></svg><footer>v1.22.0</footer></section>';
  const original=await hash(base);
  assert.equal(await hash(base.replace('<section>','<section class="wide" style="margin:20px">').replace('M0 0L10 10','M30 0L100 10').replace('v1.22.0','v1.23.0')),original);
  assert.notEqual(await hash(base.replace('One transfer','Two transfers')),original);
  assert.notEqual(await hash(base.replace('Check balances','Ignore balances')),original);
  assert.notEqual(await hash(base.replace('data-to="release"','data-to="hold"')),original);
 } finally {await browser.close();}
});
test('shared recordings still require review of each destination and script',()=>{
 const common={contentSha256:'a',scriptSha256:'b',audioSha256:'c'};
 const candidates={executive:common,technical:{...common,contentSha256:'d'}};
 const reviewed=Object.fromEntries(Object.entries(candidates).map(([id,c])=>[id,{...c,decision:'retained',reason:'Reviewed audience fit'}]));
 assert.deepEqual(problems(candidates,reviewed),[]);
 assert.deepEqual(problems({...candidates,technical:{...candidates.technical,contentSha256:'new'}},reviewed),['technical']);
 assert.deepEqual(problems({...candidates,executive:{...common,scriptSha256:'new'}},reviewed),['executive']);
 assert.deepEqual(problems({executive:common},reviewed),['technical (removed destination)']);
});
