const {test}=require('node:test'), assert=require('node:assert/strict'),{decide}=require('./pilot-decision.cjs');
const c=(low,high=low)=>({low,high,baselineTasks:40,pilotTasks:40});
const p=(cases,extra={})=>({cases,adoption:60,withinCostCap:true,...extra});
test('exact 10 and 15 percent decision boundaries are explicit',()=>{
 assert.equal(decide(p([c(10),c(8)])),'extend/redesign');
 assert.equal(decide(p([c(15),c(8)])),'go, limited scope');
 assert.equal(decide(p([c(9.99),c(8)])),'stop/hold');
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
