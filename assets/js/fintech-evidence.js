(() => {
 'use strict';
 const cases=[...document.querySelectorAll('[data-fe-case]')], buttons=[...document.querySelectorAll('[data-filter]')];
 const panels=[...document.querySelectorAll('[data-fe-pilot]')], select=document.querySelector('[data-fe-pilot-select]');
 if(!select) return;
 const pilots=JSON.parse(document.querySelector('#fe-pilot-data').textContent);
 const write=(key,value)=>{const url=new URL(location.href);url.searchParams.set(key,value);history.replaceState(null,'',url);};
 const filter=(value,update)=>{
  if(!buttons.some(button=>button.dataset.filter===value))value='all';
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===value)));
  cases.forEach(item=>{item.hidden=value!=='all'&&item.dataset.feCase!==value;});
  document.querySelector('[data-fe-count]').textContent=`Showing ${cases.filter(item=>!item.hidden).length} of ${cases.length} cases`;
  if(update)write('evidence',value);
 };
 const choose=(value,update)=>{
  if(!pilots.some(pilot=>pilot.id===value))value='design';
  select.value=value;panels.forEach(panel=>{panel.hidden=panel.dataset.fePilot!==value;});
  document.querySelector('[data-fe-export-status]').textContent='';if(update)write('pilot',value);
 };
 const revealHash=()=>{const target=cases.find(item=>'#'+item.id===location.hash);if(target?.hidden){filter('all',true);target.scrollIntoView();}};
 document.querySelector('[data-fe-filter]').hidden=false;
 document.querySelector('[data-fe-pilot-controls]').hidden=false;
 buttons.forEach(button=>button.addEventListener('click',()=>filter(button.dataset.filter,true)));
 select.addEventListener('change',()=>choose(select.value,true));
 const restore=()=>{const params=new URLSearchParams(location.search);filter(params.get('evidence'),false);choose(params.get('pilot'),false);revealHash();};
 addEventListener('hashchange',revealHash);addEventListener('popstate',restore);restore();
 const exportButton=document.querySelector('[data-fe-export]');exportButton.hidden=false;
 exportButton.addEventListener('click',()=>{
  const pilot=pilots.find(item=>item.id===select.value);
  const labels={fit:'When it fits',stack:'Example stack',input:'Client inputs',output:'Deliverable',dependency:'Prerequisites',modernization:'QE modernization dependency',measure:'Measures',gate:'Acceptance condition',fail:'Pause condition',question:'Discovery question'};
  const lines=['# AI × QE: '+pilot.title,'','Proposed client discussion brief. No client readiness or savings is assumed.',''];
  for(const [key,label] of Object.entries(labels))lines.push('## '+label,'',pilot[key],'');
  lines.push('## Evaluation contract','','Agree scope and acceptance criteria before work begins. Compare matched conventional and assisted tasks using the same foundations. Include failed attempts, review, rework and operating costs. Keep setup and environment wait separate.','',
   '## Modernization readiness decision','','Record the named owner, evidence, remediation cost and review date for every required capability. An unresolved execution dependency blocks that execution scope. Reviewed drafting can proceed only when its own prerequisites are met.','',
   '## Commercial next step','','Confirm the workflow owner, representative artifacts, reviewer capacity and readiness evidence. Agree assessment, remediation, pilot delivery and ongoing support separately.','',
   '## Reference material','','Evidence: https://tomqwu.github.io/ai_qe/case-studies/fintech/evidence/','QE modernization: https://tomqwu.github.io/ai_qe/qe-modernization/#workstreams',`Readiness: https://tomqwu.github.io/ai_qe/platform-readiness/?scope=pilot&preset=unknown&workflow=${pilot.readiness_workflow}#assessment`,'Harbor is a fictional 75-person scenario; its 12-week sequence and eight-person pilot are planning assumptions.','');
  const href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}));
  const a=document.createElement('a');a.href=href;a.download=`ai-qe-${pilot.id}-trial-brief.md`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
  document.querySelector('[data-fe-export-status]').textContent='Downloaded the '+pilot.title.toLowerCase()+' discussion brief.';
 });
})();
