const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../_data/adoption.json'),{assess}=require('../assets/js/readiness-model.js');
const levels=n=>Object.fromEntries(data.dependencies.map(d=>[d.id,n]));
test('every workflow and source points to an explicit adoption assumption',()=>{
 assert.equal(data.dependencies.length,12);assert.equal(new Set(data.dependencies.map(d=>d.id)).size,12);
 assert.equal(data.workflows.length,9);
 for(const flow of data.workflows)for(const id of flow.needs)assert.ok(data.dependencies.some(d=>d.id===id),`${flow.id}: ${id}`);
 for(const dependency of data.dependencies){for(const field of ['owner','assumption','evidence','action','harbor'])assert.ok(dependency[field]);for(const id of dependency.sources)assert.ok(data.sources.some(s=>s.id===id));}
});
test('unknown client conditions never establish readiness',()=>{
 for(const flow of data.workflows){const r=assess(data,flow.id,'pilot',{});assert.equal(r.ready,false);assert.equal(r.gaps.length,r.requirements.length);}
});
test('one missing dependency cannot be averaged away by eleven mature ones',()=>{
 const current=levels(3);current.virtualization=0;
 assert.equal(assess(data,'automation','pilot',current).ready,false);
 assert.deepEqual(assess(data,'automation','pilot',current).gaps.map(g=>g.id),['virtualization']);
 assert.equal(assess(data,'requirements','pilot',current).ready,true,'A narrower drafting workflow has its own prerequisites');
});
test('second-team rollout needs supported reuse beyond a repeatable pilot',()=>{
 assert.equal(assess(data,'automation','pilot',levels(2)).ready,true);
 assert.deepEqual(assess(data,'automation','scale',levels(2)).gaps.map(g=>g.id).sort(),['evidence','people','platform']);
 assert.equal(assess(data,'automation','scale',levels(3)).ready,true);
});
test('AI access and funded measurement are prerequisites even for draft workflows',()=>{
 for(const id of ['ai','measurement']){const current=levels(3);current[id]=1;for(const flow of data.workflows)assert.equal(assess(data,flow.id,'pilot',current).ready,false);}
});
test('invalid or missing maturity inputs remain unknown',()=>{
 for(const value of [-1,4,NaN,2.5,'3',null]){const current=levels(3);current.ai=value;assert.equal(assess(data,'reporting','pilot',current).gaps[0].level,0);}
 assert.throws(()=>assess(data,'missing','pilot',{}));assert.throws(()=>assess(data,'design','invalid',{}));
});

test('diagnosis-only evidence review does not require an execution environment',()=>{
 const current=levels(3); for(const id of ['infra','devops','data','automation'])current[id]=0;
 assert.equal(assess(data,'diagnosis','pilot',current).ready,true);
 assert.equal(assess(data,'triage','pilot',current).ready,false);
 current.evidence=0; assert.equal(assess(data,'diagnosis','pilot',current).ready,false);
});
