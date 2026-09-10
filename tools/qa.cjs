// Shared local/CI suite inventory. Fail at the named suite; do not hide retries.
const {spawnSync}=require('node:child_process');
const groups=require('./qa-groups.json');
const [mode, group]=process.argv.slice(2);
function run(command,args){console.log('Checking:',command,args.join(' '));const r=spawnSync(command,args,{stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
if(mode==='browser'){
 const keys=group?[group]:Object.keys(groups);for(const key of keys){if(!groups[key])throw Error('Unknown group: '+key);for(const suite of groups[key])run(process.execPath,['tools/'+suite+'.cjs']);}
}else if(mode==='site'){
 for(const file of ['verify_site','verify_industry','verify_publication','verify_fintech','verify_routes','verify_pdf','verify_qe_scope'])run(process.env.QE_PYTHON||'python3',['tools/'+file+'.py',...(file==='verify_pdf'?[]:['_site'])]);
 run(process.execPath,['tools/narration-review.cjs','--site','_site']);
}else throw Error('Usage: node tools/qa.cjs browser [group] | site');
