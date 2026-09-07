(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.QEReadiness=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function assess(data, workflowId, scope, levels) {
  const workflow=data.workflows.find(item=>item.id===workflowId);
  if(!workflow) throw new Error('Unknown workflow');
  if(!['pilot','scale'].includes(scope)) throw new Error('Unknown adoption scope');
  const needs=new Set(workflow.needs);
  needs.add('platform'); // Every pilot needs an owner; rollout needs demonstrated reuse.
  if(scope==='scale') ['platform','people','evidence'].forEach(id=>needs.add(id));
  const requirements=data.dependencies.filter(item=>needs.has(item.id)).map(item=>{
   const entered=levels[item.id];
   const level=Number.isInteger(entered)&&entered>=0&&entered<=3?entered:0;
   const minimum=scope==='scale'&&['platform','people','evidence'].includes(item.id)?3:2;
   return {id:item.id,title:item.title,level,minimum,met:level>=minimum};
  });
  const gaps=requirements.filter(item=>!item.met);
  return {workflow,requirements,gaps,ready:gaps.length===0};
 }
 return {assess};
});
