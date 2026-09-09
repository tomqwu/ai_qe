const {test}=require('node:test'), assert=require('node:assert/strict'),{decide}=require('./pilot-decision.cjs');
const c=(low,high=low)=>({low,high,baselineTasks:40,pilotTasks:40});
const charter={objective:'effort',owner:'Pilot sponsor',valueRationale:'Redeploy capacity to the accepted backlog',approved:true,fundedCostCeiling:true};
const p=(cases,extra={})=>({charter,cases,adoption:60,withinCostCap:true,...extra});
test('exact 10 and 15 percent decision boundaries are explicit',()=>{
 assert.equal(decide(p([c(10),c(8)])),'extend/redesign');
 assert.equal(decide(p([c(15),c(8)])),'go, limited scope');
 assert.equal(decide(p([c(9.99),c(8)])),'stop/hold');
});
test('quality can justify a funded pilot without cash capture or effort gains',()=>{
 const q={...charter,objective:'quality',valueRationale:'Detect agreed critical payment faults',criterion:{metric:'Critical faults detected',unit:'percent',target:100,direction:'at-least',minTasksPerArm:10,reference:'Approved fixed fault catalogue'}};
 const evidence={low:100,high:100,baselineTasks:10,pilotTasks:10,reference:'Reviewed complete fault-run records'};
 assert.equal(decide(p([c(-5),c(-2)],{charter:q,outcome:evidence})),'go, limited scope');
 assert.equal(decide(p([],{charter:q,outcome:evidence,breach:true})),'stop/hold');
 assert.equal(decide(p([],{charter:q,outcome:{...evidence,low:90,high:100}})),'insufficient evidence');
 assert.equal(decide(p([],{charter:q,outcome:{...evidence,reference:''}})),'insufficient evidence');
 assert.equal(decide(p([],{charter:q,outcome:evidence,withinCostCap:false})),'extend/redesign');
});
test('cash claims require recognized evidence and every route requires a charter',()=>{
 const input=p([c(18)],{charter:{...charter,objective:'cash'}});
 assert.equal(decide(input),'insufficient evidence');
 assert.equal(decide({...input,cashClaim:{netSaving:1000,financeValidated:true,reference:'Approved register row'}}),'go, limited scope');
 assert.equal(decide({...input,cashClaim:{netSaving:0,financeValidated:true,reference:'Approved register row'}}),'extend/redesign');
 assert.equal(decide(p([c(18)],{charter:null})),'insufficient evidence');
 assert.equal(decide(p([c(18)],{charter:{...charter,fundedCostCeiling:false}})),'insufficient evidence');
});
test('reliability criteria retain direction, uncertainty and sufficient exposure',()=>{
 const q={...charter,objective:'reliability',criterion:{metric:'Failed repeat runs',unit:'percent',target:5,direction:'at-most',minTasksPerArm:30,reference:'Approved repeatability protocol'}};
 const evidence={low:1,high:4,baselineTasks:40,pilotTasks:40,reference:'All attempted runs'};
 assert.equal(decide(p([],{charter:q,outcome:evidence})),'go, limited scope');
 assert.equal(decide(p([],{charter:q,outcome:{...evidence,high:6}})),'insufficient evidence');
 assert.equal(decide(p([],{charter:q,outcome:{...evidence,pilotTasks:2}})),'insufficient evidence');
});
test('uncertainty and missing exposure prevent unsupported gate decisions',()=>{
 assert.equal(decide(p([c(9,11),c(8)])),'insufficient evidence');
 assert.equal(decide(p([c(14,16),c(8)])),'insufficient evidence');
 assert.equal(decide(p([{...c(18),pilotTasks:4},c(8)])),'insufficient evidence');
 assert.equal(decide(p([c(18),c(8)],{complete:false})),'insufficient evidence');
});
test('control breaches override gains; missed adoption or cost requires redesign',()=>{
 assert.equal(decide(p([c(18),c(8)],{breach:true})),'stop/hold');
 assert.equal(decide(p([c(18),c(8)],{adoption:49.99})),'extend/redesign');
 assert.equal(decide(p([c(18),c(8)],{withinCostCap:false})),'extend/redesign');
});
