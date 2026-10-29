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

test('제목을 반복하는 요약만 숨기고 새로운 설명은 유지한다', async () => {
  const { getListSummary } = await import('./filter-posts.ts');
  assert.equal(getListSummary('AtCoder Weekday Contest 001', 'Atcoder Weekday Contest 001 풀이'), null);
  assert.equal(getListSummary('[BOJ] 123 문제', 'BOJ 123 문제 풀이'), null);
  assert.equal(getListSummary('BFS', 'BFS 풀이에서 큐를 사용하는 이유'), 'BFS 풀이에서 큐를 사용하는 이유');
});

test('종류별 태그 개수는 해당 종류에서만 집계하고 기본 종류는 아티클이다', async () => {
  const { getKindTags } = await import('./filter-posts.ts');
  assert.deepEqual(getKindTags(posts, 'article'), [{tag:'CS',count:2},{tag:'Network',count:2}]);
  assert.deepEqual(getKindTags(posts, 'solve-log'), [{tag:'CS',count:1}]);
  assert.deepEqual(getKindTags(posts, 'all'), [{tag:'CS',count:3},{tag:'Network',count:2}]);
});

test('더 보기 개수는 15개 단위로 복원하고 잘못된 값은 기본값으로 처리한다', async () => {
  const { getVisiblePostCount } = await import('./filter-posts.ts');
  assert.equal(getVisiblePostCount(null, 45), 15);
  assert.equal(getVisiblePostCount('30', 45), 30);
  assert.equal(getVisiblePostCount('45', 32), 32);
  for (const value of ['-15', '0', '16', 'Infinity', '30abc']) assert.equal(getVisiblePostCount(value, 45), 15);
  assert.equal(getVisiblePostCount(null, 0), 0);
});
