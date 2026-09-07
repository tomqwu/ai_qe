const {test}=require('node:test'), assert=require('node:assert/strict');
const {capacity,payment}=require('../assets/js/fintech-model.js');
const data=require('../_data/fintech_case.json');
test('one bounded pack includes every workflow stage and all review effort',()=>{
 const r=capacity(data,'mixed',50);
 assert.equal(r.baseline,300); assert.equal(r.after,222); assert.equal(r.review,40);
 assert.equal(r.gross,78); assert.equal(r.net,66); assert.equal(r.usable,33); assert.equal(r.packs,15);
 assert.equal(data.staff.reduce((n,g)=>n+g.count,0),75);
});
test('capture cannot conceal a slowdown and zero capture cannot repay setup',()=>{
 for(const capture of [0,1,50,100]) {const r=capacity(data,'foundation',capture);assert.equal(r.after,315);assert.equal(r.usable,-27);assert.equal(r.packs,null);}
 assert.equal(capacity(data,'mixed',0).packs,null);
 assert.equal(capacity(data,'repeatable',50).after,190);
 assert.equal(capacity(data,'repeatable',50).packs,10);
});
test('higher capture never reduces usable positive capacity; round recovery up',()=>{
 let prior=0;
 for(let capture=0;capture<=100;capture++) {
  const r=capacity(data,'mixed',capture);assert.ok(r.usable>=prior);prior=r.usable;
  if(r.packs!==null){assert.ok(r.packs*r.usable>=data.pilot.setupHours);assert.ok((r.packs-1)*r.usable<data.pilot.setupHours);}
 }
});
test('malformed inputs cannot create plausible capacity outputs',()=>{
 for(const value of [-1,101,NaN,Infinity,'50'])assert.throws(()=>capacity(data,'mixed',value));
 assert.throws(()=>capacity(data,'unknown',50));
 const copy=structuredClone(data);copy.profiles[1].review.pop();assert.throws(()=>capacity(copy,'mixed',50));
 const negative=structuredClone(data);negative.profiles[1].work[0]=-1;assert.throws(()=>capacity(negative,'mixed',50));
});
test('duplicate delivery must fail even when the duplicated journals balance',()=>{
 for(const scenario of ['retry','callback']) {
  const bad=payment(scenario,true),good=payment(scenario,false);
  assert.equal(bad.payer+bad.recipient,100000);assert.equal(bad.pass,false);assert.equal(bad.journals,2);
  assert.equal(good.journals,1);assert.equal(good.payer,90000);assert.equal(good.recipient,10000);assert.equal(good.pass,true);
 }
 assert.equal(payment('normal',true).pass,true);assert.throws(()=>payment('unknown',false));
});
