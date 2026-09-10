// Static slide-edition exports. Interactive controls remain in the web decks.
const {chromium}=require('playwright'), fs=require('node:fs'),path=require('node:path');
const routes=require('../_data/briefing_routes.json');
const release=fs.readFileSync(path.join(__dirname,'../_data/release.yml'),'utf8');
const version=(release.match(/slide_edition: "([^"]+)"/)||release.match(/version: "([^"]+)"/))[1];
const base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
(async()=>{const browser=await chromium.launch();try{
 const audiences=process.argv.includes('--fintech') ? ['fintech-evp','fintech-technical'] : ['evp','technical'];
 for(const audience of audiences) for(const guided of [false,true]) {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await page.goto(`${base}/briefings/${audience}/`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(() => {
   const canonical = new URL(document.querySelector('link[rel="canonical"]').href);
   document.querySelectorAll('a[href]').forEach(a => {
    const url = new URL(a.href);
    if (url.origin === location.origin) a.href = new URL(url.pathname + url.search + url.hash, canonical.origin).href;
   });
  });
  const key=audience.startsWith('fintech-')?audience.replace('fintech-',''):'industry-'+audience;
  const route=routes[key];
  await page.evaluate(({order,credit})=>{
    const main=document.querySelector('.slides'), slides=[...main.querySelectorAll('.slide')];
    const byId=new Map(slides.map(s=>[s.id,s]));
    slides.forEach(s=>s.remove());
    order.forEach(n=>main.append(byId.get('slide-'+n)));
    const tag=document.createElement('p');tag.className='pdf-media-credit';tag.textContent=credit;main.querySelector('.slide').append(tag);
  }, {order:guided?route.slides:route.full_order,credit:'Prepared by Tom Wu · AI-generated illustrations · Synthetic English narration in the web presentation.'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const overflow=await page.locator('.slide-content').evaluateAll(items=>items.filter(el=>el.scrollHeight-el.clientHeight>3).map(el=>({slide:el.closest('.slide').id,extra:el.scrollHeight-el.clientHeight})));
  if(overflow.length) throw new Error('Print content exceeds master: '+JSON.stringify(overflow));
  const edition=audience.startsWith('fintech-') ? (release.match(/fintech_edition: "([^"]+)"/))[1] : version;
  const output=path.join(__dirname,`../assets/pdf/ai-qe-${audience}${guided?'-guided':''}-v${edition}.pdf`);
  await page.pdf({path:output,printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  require('node:child_process').execFileSync(process.env.QE_PYTHON||'python3',['tools/pdf_metadata.py',output]);
  console.log(output);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
