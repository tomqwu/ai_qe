// Static slide-edition exports. Interactive controls remain in the web decks.
const {chromium}=require('playwright'), fs=require('node:fs'),path=require('node:path');
const version=fs.readFileSync(path.join(__dirname,'../_data/release.yml'),'utf8').match(/version: "([^"]+)"/)[1];
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
(async()=>{const browser=await chromium.launch();try{
 for(const audience of ['evp','technical']) {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await page.goto(`${base}/briefings/${audience}/`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(() => {
   const canonical = new URL(document.querySelector('link[rel="canonical"]').href);
   document.querySelectorAll('a[href]').forEach(a => {
    const url = new URL(a.href);
    if (url.origin === location.origin) a.href = new URL(url.pathname + url.search + url.hash, canonical.origin).href;
   });
  });
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const overflow=await page.locator('.slide-content').evaluateAll(items=>items.filter(el=>el.scrollHeight-el.clientHeight>3).map(el=>({slide:el.closest('.slide').id,extra:el.scrollHeight-el.clientHeight})));
  if(overflow.length) throw new Error('Print content exceeds master: '+JSON.stringify(overflow));
  const output=path.join(__dirname,`../assets/pdf/ai-qe-${audience}-v${version}.pdf`);
  await page.pdf({path:output,printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  console.log(output);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
