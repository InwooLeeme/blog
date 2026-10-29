import test from 'node:test';
import assert from 'node:assert/strict';
import { createKnowledgeMap } from './knowledge-map.ts';

test('shared tags become hubs, with one membership per post and no dangling edges', () => {
  const result = createKnowledgeMap({nodes: [
    {id:'one', title:'First', tags:['CS','CS']},
    {id:'two', title:'Second', tags:['CS','Web']},
  ], edges:[{source:'one',target:'two',kind:'series',weight:2}]});
  assert.equal(result.nodes.filter(n => n.kind === 'post').length, 2);
  assert.equal(result.nodes.filter(n => n.kind === 'tag').length, 2);
  assert.equal(result.edges.filter(e => e.kind === 'tag').length, 3);
  assert.equal(result.edges.filter(e => e.kind === 'series').length, 1);
  const ids = new Set(result.nodes.map(n => n.id));
  assert.ok(result.edges.every(e => ids.has(e.source) && ids.has(e.target)));
});

test('post IDs cannot collide with tag names and existing pairwise tag edges are replaced', () => {
  const result = createKnowledgeMap({nodes:[
    {id:'CS',title:'CS article',tags:['CS']}, {id:'other',title:'Other',tags:['CS']},
  ], edges:[{source:'CS',target:'other',kind:'tag',weight:1}, {source:'CS',target:'missing',kind:'series',weight:2}]});
  assert.equal(new Set(result.nodes.map(n=>n.id)).size, 3);
  assert.equal(result.edges.length, 2);
  assert.ok(result.edges.every(e=>e.target==='tag:CS'));
});

test('empty input remains empty without decorative fake nodes', () => {
  assert.deepEqual(createKnowledgeMap({nodes:[],edges:[]}), {nodes:[],edges:[]});
});

test('list search finds tag matches and respects visible graph nodes and selected tag', async () => {
  const { filterMapPosts } = await import('./knowledge-map.ts');
  const map = createKnowledgeMap({nodes:[{id:'one',title:'TCP basics',tags:['Network','CS']},{id:'two',title:'Patterns',tags:['CS']},{id:'three',title:'Diary',tags:[]}],edges:[]});
  assert.deepEqual(filterMapPosts(map,{tags:true,series:true,orphans:true},' network ',null).map(n=>n.slug),['one']);
  assert.deepEqual(filterMapPosts(map,{tags:true,series:true,orphans:true},'','CS').map(n=>n.slug),['one','two']);
  assert.deepEqual(filterMapPosts(map,{tags:false,series:true,orphans:false},'',null),[]);
  assert.deepEqual(filterMapPosts(map,{tags:true,series:true,orphans:true},'missing',null),[]);
});
