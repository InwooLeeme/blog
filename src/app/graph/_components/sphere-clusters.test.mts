import test from 'node:test';
import assert from 'node:assert/strict';
import { createSphereClusters } from './sphere-clusters.ts';
const input = [
 {id:'a',title:'a',kind:'post' as const,tags:['CS','Web']},
 {id:'b',title:'b',kind:'post' as const,tags:['Web']},
 {id:'tag:CS',title:'CS',kind:'tag' as const,tags:['CS']},
 {id:'tag:Web',title:'Web',kind:'tag' as const,tags:['Web']},
];
test('each article has one sphere position and its primary tag cluster freezes independently',()=>{
 const model=createSphereClusters(input);
 model.layout(1.5);
 const a={...model.positions.get('a')!},b={...model.positions.get('b')!};
 model.advance(50,new Set(['CS']));
 assert.notDeepEqual(model.positions.get('a'),a, 'stop should decelerate, not snap');
 for(let i=0;i<8;i++) model.advance(50,new Set(['CS']));
 const frozen={...model.positions.get('a')!};
 model.advance(50,new Set(['CS']));
 assert.deepEqual(model.positions.get('a'),frozen);
 assert.notDeepEqual(model.positions.get('b'),b);
 assert.equal(model.positions.size,4);
 model.advance(16,new Set());
 const resumed=model.positions.get('a')!;
 assert.ok(Math.hypot(resumed.x-frozen.x,resumed.y-frozen.y)<1,'resume must not jump to elapsed global time');
});
test('cluster hit testing includes empty space within sphere and dragging moves the whole sphere',()=>{
 const model=createSphereClusters(input);model.layout(1);
 const cluster=model.clusters[0];
 assert.equal(model.hit(cluster.x+10,cluster.y),cluster.id);
 const before={...model.positions.get('a')!};
 model.translate(cluster.id,40,25);
 assert.ok(Math.abs(model.positions.get('a')!.x-before.x-40)<1e-9);
 assert.ok(Math.abs(model.positions.get('a')!.y-before.y-25)<1e-9);
 assert.equal(model.hit(10000,10000),null);
});

test('natural layout is deterministic, avoids overlap, and uses distinct rotation axes and speeds',()=>{
 const nodes=Array.from({length:12},(_,i)=>({id:`p${i}`,title:`p${i}`,kind:'post' as const,tags:[`t${i}`,`t${(i+1)%12}`]}));
 const a=createSphereClusters(nodes),b=createSphereClusters(nodes);
 a.layout(.55);b.layout(.55);
 assert.deepEqual([...a.positions],[...b.positions]);
 for(let i=0;i<a.clusters.length;i++) for(let j=i+1;j<a.clusters.length;j++) {
  const x=a.clusters[i],y=a.clusters[j];
  assert.ok(Math.hypot(x.x-y.x,x.y-y.y)>=x.radius+y.radius+8);
 }
 assert.ok(new Set(a.clusters.map(c=>c.speed)).size>4);
 assert.ok(new Set(a.clusters.map(c=>c.tilt)).size>4);
 assert.ok(a.clusters.some(c=>c.speed<0) && a.clusters.some(c=>c.speed>0));
});

test('30fps and 60fps deceleration converge and rapid reversal stays continuous',()=>{
 const a=createSphereClusters(input),b=createSphereClusters(input);a.layout(1);b.layout(1);
 for(let i=0;i<18;i++)a.advance(1000/60,new Set(['CS']));
 for(let i=0;i<9;i++)b.advance(1000/30,new Set(['CS']));
 assert.ok(Math.abs(a.clusters[0].angle-b.clusters[0].angle)<.0001);
 const previous=a.clusters[0].angle;a.advance(16,new Set());
 assert.ok(Math.abs(a.clusters[0].angle-previous)<.0001);
 for(let i=0;i<40;i++)a.advance(16,new Set());
 assert.equal(a.clusters[0].velocity,1);
});

test('secondary tags anchor to the primary cluster with most related articles',()=>{
 const nodes=[
  {id:'a1',title:'a1',kind:'post' as const,tags:['A','shared']},
  {id:'a2',title:'a2',kind:'post' as const,tags:['A','shared']},
  {id:'b',title:'b',kind:'post' as const,tags:['B','shared']},
  {id:'tag:shared',title:'shared',kind:'tag' as const,tags:['shared']},
 ];
 const model=createSphereClusters(nodes);model.layout(1);
 const satellite=model.clusters.find(c=>c.id==='shared')!, owner=model.clusters.find(c=>c.id==='A')!;
 assert.equal(satellite.satelliteOf,'A');
 assert.ok(Math.hypot(satellite.x-owner.x,satellite.y-owner.y)<(satellite.radius+owner.radius)*1.2+65);
 assert.equal(model.positions.size,4);
});

test('hover margin retains a cluster just outside its normal hit area',()=>{
 const model=createSphereClusters(input);model.layout(1);
 const c=model.clusters[0],x=c.x+c.radius*1.15+12;
 assert.equal(model.hit(x,c.y,c.id,12),c.id);
 assert.notEqual(model.hit(x,c.y),c.id);
});
