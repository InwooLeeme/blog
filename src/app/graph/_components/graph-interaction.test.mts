import test from 'node:test';
import assert from 'node:assert/strict';
import { frontmostHit, createHoverLatch } from './graph-interaction.ts';
test('overlapping dots select the frontmost, but never a dot outside the hit area',()=>{
 const back={x:0,y:0,depth:-.8},front={x:3,y:0,depth:.8},outside={x:20,y:0,depth:1};
 assert.equal(frontmostHit([back,front,outside],0,0,()=>8),front);
 assert.equal(frontmostHit([back,front],100,100,()=>8),null);
});
test('brief exit/reentry keeps a cluster frozen, real exit releases and switching is immediate',()=>{
 const latch=createHoverLatch();latch.enter('CS',0);latch.enter(null,100);
 assert.equal(latch.value(250),'CS');latch.enter('CS',280);assert.equal(latch.value(500),'CS');
 latch.enter(null,510);assert.equal(latch.value(731),null);
 latch.enter('CS',800);latch.enter('Web',801);assert.equal(latch.value(801),'Web');latch.clear();assert.equal(latch.value(802),null);
});
