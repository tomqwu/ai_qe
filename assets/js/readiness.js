(() => {
 'use strict';
 const dataNode=document.querySelector('#readiness-data');
 if(!dataNode||!window.QEReadiness) return;
 const data=JSON.parse(dataNode.textContent), preset=document.querySelector('#readiness-preset'), workflow=document.querySelector('#readiness-workflow'), scope=document.querySelector('#readiness-scope');
 const cards=[...document.querySelectorAll('[data-dependency]')];
 let levels={}, result;
 const setText=(selector,text)=>document.querySelector(selector).textContent=text;
 function update() {
  result=QEReadiness.assess(data,workflow.value,scope.value,levels);
  setText('[data-readiness-title]',result.ready?'Ready for owner review':'Resolve prerequisites before adoption');
  setText('[data-readiness-summary]',`${result.requirements.length-result.gaps.length} of ${result.requirements.length} required capabilities meet the selected discussion level. ${result.ready?'Review evidence and obtain the accountable owner’s decision before proceeding.':`${result.gaps.length} prerequisites remain below the required level; no average score overrides them.`}`);
  setText('[data-readiness-output]',`Intended output: ${result.workflow.output}.`);
  const list=document.querySelector('[data-readiness-gaps]');list.replaceChildren();
  result.gaps.forEach(gap=>{const li=document.createElement('li'),a=document.createElement('a');a.href=`#dependency-${gap.id}`;a.textContent=`${gap.title} — level ${gap.level}; needs ${gap.minimum}`;li.append(a);list.append(li);});
  document.querySelector('[data-readiness-decision]').dataset.ready=String(result.ready);
  cards.forEach(card=>{const requirement=result.requirements.find(item=>item.id===card.dataset.dependency);card.dataset.required=String(Boolean(requirement));card.querySelector('[data-dependency-requirement]').textContent=requirement?`Required · level ${requirement.minimum}`:'Outside this workflow’s minimum';card.querySelector('select').value=levels[card.dataset.dependency];});
  document.querySelectorAll('[data-map-dependency]').forEach(link=>{const required=result.requirements.some(item=>item.id===link.dataset.mapDependency);link.dataset.required=String(required);link.title=required?'Required for the selected workflow':'Inspect this dependency';});
  const url=new URL(location.href);url.searchParams.set('workflow',workflow.value);url.searchParams.set('scope',scope.value);preset.value==='custom'?url.searchParams.delete('preset'):url.searchParams.set('preset',preset.value);history.replaceState(null,'',url);
 }
 function applyPreset() {
  data.dependencies.forEach(item=>{levels[item.id]=preset.value==='harbor'?item.level:preset.value==='repeatable'?2:preset.value==='reused'?3:0;});
  cards.forEach(card=>card.querySelector('textarea').value='');update();
 }
 const params=new URLSearchParams(location.search);
 if(data.workflows.some(item=>item.id===params.get('workflow')))workflow.value=params.get('workflow');
 if(['pilot','scale'].includes(params.get('scope')))scope.value=params.get('scope');
 if(['unknown','harbor','repeatable','reused'].includes(params.get('preset')))preset.value=params.get('preset');
 document.querySelectorAll('[data-readiness-controls]').forEach(item=>item.hidden=false);
 preset.addEventListener('change',applyPreset);workflow.addEventListener('change',update);scope.addEventListener('change',update);
 cards.forEach(card=>{card.querySelector('select').addEventListener('change',event=>{levels[card.dataset.dependency]=Number(event.target.value);preset.value='custom';update();});card.querySelector('textarea').addEventListener('input',()=>{preset.value='custom';update();});});
 document.querySelector('[data-readiness-export]').addEventListener('click',()=>{
  const sheet={edition:document.querySelector('script[src*="readiness.js"]').src.split('?v=')[1],created:new Date().toISOString(),status:'Self-assessed discussion worksheet; not verified or approved',application:document.querySelector('#readiness-application').value.trim()||'Unspecified — complete before review',workflow:workflow.value,scope:scope.value,preset:preset.value,requirements:result.requirements,dependencies:data.dependencies.map(item=>({id:item.id,title:item.title,level:levels[item.id],assumption:item.assumption,ownerRole:item.owner,evidenceNeeded:item.evidence,firstAction:item.action,notes:cards.find(card=>card.dataset.dependency===item.id).querySelector('textarea').value}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(sheet,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='ai-qe-adoption-assumptions.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 applyPreset();
})();
