// Bind accepted explanations to their rendered semantic destinations.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function semantic(element) {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('style,footer,.slide-footer,.slide-narrator-notes,script:not([type="application/json"]),defs').forEach(n=>n.remove());
  const clean = value => {
    if(Array.isArray(value))return value.map(clean);
    if(value && typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>!['x','y','z','d','width','height','node_height','position','rotation','scale','color'].includes(k)).map(k=>[k,clean(value[k])]));
    return value;
  };
  const json = [...clone.querySelectorAll('script[type="application/json"]')].map(n=>{let data;try{data=clean(JSON.parse(n.textContent));}catch{data=n.textContent.trim();}n.remove();return data;});
  const relations = [...clone.querySelectorAll('[data-flow-node],[data-from],[data-to],[data-step-node]')].map(n=>Object.fromEntries(['data-flow-node','data-from','data-to','data-step-node'].filter(k=>n.hasAttribute(k)).map(k=>[k,n.getAttribute(k)])));
  const labels = [...clone.querySelectorAll('[aria-label],img[alt]')].map(n=>n.getAttribute('aria-label')||n.getAttribute('alt'));
  return {text:clone.textContent.replace(/\s+/g,' ').trim(),labels,relations,json};
}
function problems(candidates, reviews) {
  const errors=[];
  for(const [id,current] of Object.entries(candidates)) {
    const accepted=reviews[id];
    if(!accepted || accepted.contentSha256!==current.contentSha256 || accepted.scriptSha256!==current.scriptSha256 || accepted.audioSha256!==current.audioSha256 || !accepted.reason?.trim() || !['retained','refreshed','baseline'].includes(accepted.decision)) errors.push(id);
  }
  for(const id of Object.keys(reviews))if(!candidates[id])errors.push(id+' (removed destination)');
  return errors;
}
async function collect(site) {
  const scripts=JSON.parse(fs.readFileSync(path.join(root,'assets/data/narration-scripts.json'))).decks;
  const media=JSON.parse(fs.readFileSync(path.join(root,'assets/data/narration.json'))).decks;
  const guides=JSON.parse(fs.readFileSync(path.join(root,'assets/data/narration-guides.json')));
  const flows=JSON.parse(fs.readFileSync(path.join(root,'assets/data/narration-flows.json'))).profiles;
  const browser=await chromium.launch();
  const records={};
  const add=(id,key,source,content,diagrams=[])=>{
    const [deck,slide]=key.split('/'),script=scripts[deck][slide],clip=media[deck].slides[slide];
    records[id]={clip:key,source,diagrams,contentSha256:digest({content,cues:flows.filter(p=>p.clip===key&&diagrams.includes(p.diagram))}),scriptSha256:digest({title:script.title,text:script.text,speakText:script.speakText}),audioSha256:clip.sha256};
  };
  try {
    const page=await browser.newPage({javaScriptEnabled:false});
    await page.route('**/*',route=>route.abort());
    const htmlFiles=[];
    function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.html'))htmlFiles.push(file);}}
    walk(site);
    for(const file of htmlFiles.sort()) {
      const route='/'+path.relative(site,file).replace(/index\.html$/,'');
      await page.setContent(fs.readFileSync(file,'utf8'),{waitUntil:'domcontentloaded'});
      const deck=await page.locator('body').getAttribute('data-narration-audience');
      if(deck) {
        for(const slide of await page.locator('.slide').all()) {
          const id=await slide.getAttribute('id');
          const content=await slide.evaluate(semantic);
          const diagrams=await slide.locator('[data-diagram]').evaluateAll(nodes=>nodes.map(n=>n.dataset.diagram));
          add('slide:'+deck+'/'+id,deck+'/'+id,route+'#'+id,content,diagrams);
        }
        continue;
      }
      for(const guide of guides.guides) {
        if(guide.path&&guide.path!==route)continue;
        let i=0;
        for(const target of await page.locator(guide.selector).all()) {
          if(await target.evaluate(n=>Boolean(n.closest('.slide'))))continue;
          const key=guide.deck+'/'+guide.slide;
          const diagrams=await target.evaluate(n=>[n.dataset.diagram,...[...n.querySelectorAll('[data-diagram]')].map(c=>c.dataset.diagram)].filter(Boolean));
          add('guide:'+route+':'+guide.selector+':'+i++,key,route,{visual:await target.evaluate(semantic),guide:guide.guide,baseline:Boolean(guide.baseline)},diagrams);
        }
      }
    }
    const scene=JSON.parse(fs.readFileSync(path.join(root,'assets/data/architecture-demo.json')));
    for(const [scenario,guide] of Object.entries(guides.demo)) add('demo:'+scenario,guide.deck+'/'+guide.slide,'/demos/architecture/?scenario='+scenario,{scene,guide});
  } finally {await browser.close();}
  return records;
}
async function main() {
  const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
  const site=path.resolve(args.includes('--site')?value('--site'):'_site');
  const file=path.join(root,'assets/data/narration-review.json');
  const candidates=await collect(site);
  if(args.includes('--candidates'))fs.writeFileSync(value('--candidates'),JSON.stringify(candidates,null,2)+'\n');
  let reviews=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)).reviews:{};
  if(args.includes('--bootstrap')) {
    if(Object.keys(reviews).length)throw Error('Baseline already exists; use explicit per-destination decisions');
    const reason=value('--bootstrap');if(!reason?.trim())throw Error('A baseline review reason is required');
    reviews=Object.fromEntries(Object.entries(candidates).map(([id,data])=>[id,{...data,decision:'baseline',reviewedOn:new Date().toISOString().slice(0,10),reason}]));
  }
  if(args.includes('--accept')) {
    const decisions=JSON.parse(fs.readFileSync(value('--accept')));
    for(const [id,decision] of Object.entries(decisions)) {
      if(!decision.reason?.trim()||!['retained','refreshed','removed'].includes(decision.decision))throw Error('Explicit review decision and reason required: '+id);
      if(decision.decision==='removed'){if(candidates[id])throw Error('Destination still exists: '+id);delete reviews[id];continue;}
      if(!candidates[id])throw Error('Unknown review destination: '+id);
      reviews[id]={...candidates[id],...decision,reviewedOn:new Date().toISOString().slice(0,10)};
    }
  }
  if(args.includes('--bootstrap')||args.includes('--accept'))fs.writeFileSync(file,JSON.stringify({schemaVersion:1,reviews},null,2)+'\n');
  const stale=problems(candidates,reviews);
  if(stale.length)throw Error('Narration content review required:\n'+stale.join('\n'));
  console.log(`Narration content review verified: ${Object.keys(reviews).length} slide, page and demo destinations`);
}
module.exports={semantic,digest,problems,collect};
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
