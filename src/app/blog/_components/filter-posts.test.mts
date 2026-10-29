import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPosts } from './filter-posts.ts';
const posts = [
  {slug:'old',meta:{title:'TCP 기초',date:'2026-01-01',tags:['CS','Network']}},
  {slug:'log',meta:{title:'BFS 풀이',date:'2026-10-28',tags:['CS'],kind:'solve-log' as const}},
  {slug:'new',meta:{title:'TCP 복습',date:'2026-10-29',tags:['CS','Network'],kind:'article' as const}},
];
test('전체 글은 최신순이고 원본 순서를 변경하지 않는다', () => {
  assert.deepEqual(filterPosts(posts,'',null,'all').map(p=>p.slug),['new','log','old']);
  assert.equal(posts[0].slug,'old');
});
test('제목·태그 검색은 공백과 대소문자를 정규화하고 태그·종류와 교집합을 이룬다', () => {
  assert.deepEqual(filterPosts(posts,'  tcp NETWORK ','CS','article').map(p=>p.slug),['new','old']);
  assert.deepEqual(filterPosts(posts,'tcp','CS','solve-log'),[]);
  assert.deepEqual(filterPosts(posts,'','Network','all').map(p=>p.slug),['new','old']);
  assert.deepEqual(filterPosts(posts,'없는 글',null,'all'),[]);
});
