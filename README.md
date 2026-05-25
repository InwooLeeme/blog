# InwooLeeme.dev

> Next.js 16 + MDX 기반 개인 기술 블로그. 알고리즘 풀이와 개발 노트를 정리합니다.

🔗 https://inwooleeme.vercel.app

---

## 주요 기능

### 콘텐츠
- **MDX 글 작성** — `content/posts/*.mdx`
- **알고리즘 노트** — `content/notes/**/*.mdx`, 폴더 트리 사이드바
- **태그 시스템** — 사이드바, 태그별 페이지, 태그 카운트
- **글 검색** — Fuse.js 기반 클라이언트 검색 (`Cmd+K`)
- **목차(TOC)** — tocbot 기반 sticky 사이드바
- **댓글** — Giscus
- **관련 글 / 이전·다음 글** — 태그 겹침 점수 기반

### 글쓰기 도구 (커스텀 MDX 컴포넌트)
- `<Callout>` — info / warn / danger 변형
- `<Steps>` / `<Step>` — 절차 표시
- `<Complexity>` — 시간/공간 복잡도 박스
- `<ProblemMeta>` — BOJ/AtCoder/Codeforces 등 문제 메타
- `<Rank>` — 알고리즘 랭크 배지
- **코드 블록** — Monokai 테마, 파일명 헤더, diff 표기, 라인 번호/하이라이트
- **수식** — KaTeX (`$inline$`, `$$block$$`)
- **이미지** — `next/image` 자동 적용

### 디자인 / 발견성
- **동적 OG 이미지** — `next/og` 기반, 글마다 자동 생성 (Pretendard 폰트 번들)
- **커버 이미지 fallback** — `cover` 미지정 시 OG 이미지 자동 재사용
- **Latest hero** — 최근 글 4개 호버 확장 카드 레이아웃 (lg+)
- **다크 모드** — `next-themes` 시스템 설정 연동
- **읽기 진행 바** — 글 페이지 상단 표시
- **반응형 레이아웃** — 모바일은 수평 태그 스트립, 데스크톱은 사이드바

### SEO / 배포
- `metadataBase` + OpenGraph / Twitter Card 메타데이터
- `next-sitemap`으로 빌드 시 `sitemap.xml` / `robots.txt` 생성
- Vercel Analytics

---

## 기술 스택

| 분야 | 사용 도구 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 스타일 | Tailwind CSS v4, shadcn/ui, lucide-react |
| 콘텐츠 | next-mdx-remote, gray-matter, remark-gfm, remark-math |
| 코드 하이라이트 | rehype-pretty-code, Shiki, `@shikijs/transformers` |
| 수식 | rehype-katex, KaTeX |
| 검색 | Fuse.js |
| 댓글 | @giscus/react |
| OG 이미지 | `next/og` (Satori), Pretendard |
| 분석 | @vercel/analytics |
| 배포 | Vercel |

---

## 프로젝트 구조

```
.
├── content/
│   ├── posts/              # 블로그 글 (.mdx)
│   └── notes/              # 알고리즘 노트 (.mdx, 폴더 = 카테고리)
├── public/
│   ├── fonts/              # Pretendard (OG 이미지 렌더용)
│   └── avatar.png
├── src/
│   ├── app/                # App Router
│   │   ├── blog/           # 블로그 인덱스, 글 페이지, 태그 페이지
│   │   ├── notes/          # 노트 인덱스, 동적 라우트
│   │   ├── about/          # GitHub 프로필 README fetch
│   │   ├── components/     # 도메인 컴포넌트 (PostCard, TagSidebar 등)
│   │   ├── opengraph-image.tsx           # 사이트 기본 OG
│   │   └── blog/[slug]/opengraph-image.tsx  # 글별 동적 OG
│   ├── components/ui/      # shadcn/ui 프리미티브
│   └── lib/
│       ├── posts.ts        # MDX 글 로드/정렬/필터
│       ├── notes.ts        # 노트 트리 빌드
│       └── utils.ts
├── next-sitemap.config.js
└── next.config.ts
```

---

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 (포트 3001)
npm run dev

# 빌드 (sitemap 자동 생성 포함)
npm run build

# 프로덕션 실행
npm run start

# 린트
npm run lint
```

`http://localhost:3001` 에서 확인.

---

## 글 작성 방법

### 1. 파일 생성

`content/posts/` 아래에 `.mdx` 파일 추가. 파일명이 슬러그가 됩니다.

```
content/posts/atcoder_weekday_073.mdx
→ /blog/atcoder_weekday_073
```

### 2. Frontmatter 작성

```yaml
---
title: "Atcoder Weekday Contest 073"
date: "2026-05-21"
summary: "이번 콘테스트 풀이 정리"
tags: [Atcoder, Algorithm]
draft: false        # true면 발행 제외
cover: ""           # 비우면 OG 이미지 자동 사용
---
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `title` | ✅ | 글 제목 |
| `date` | ✅ | 발행일 (ISO 형식) |
| `summary` |  | 카드/메타데이터에 사용 |
| `tags` |  | 문자열 배열 |
| `draft` |  | `true` 시 빌드에서 제외 |
| `cover` |  | 커스텀 커버 이미지 경로 |

### 3. MDX 본문 + 컴포넌트 사용

```mdx
## 풀이

<Callout type="info">
KMP 알고리즘 복습이 필요한 문제였다.
</Callout>

<ProblemMeta
  platform="AtCoder"
  link="https://atcoder.jp/contests/awc0073/tasks/awc0073_a"
  title="A - Lottery Number Matching"
  tags="data_structure"
/>

```cpp showLineNumbers
int main() {
    cout << "Hello" << endl;
}
```

<Complexity time="O(N log N)" space="O(N)" />
```

### 4. 노트 추가

`content/notes/카테고리/제목.mdx` 형식. 폴더가 그대로 사이드바 카테고리가 됩니다.

```
content/notes/Graph/Dijkstra.mdx
→ /notes/Graph/Dijkstra
```

---

## 환경변수

`.env.local` 또는 Vercel 대시보드에서:

| 변수 | 기본값 | 설명 |
|---|---|---|
| `SITE_URL` | `https://inwooleeme.vercel.app` | OG 메타 / sitemap의 절대 URL |

코드에 fallback이 있어 미설정 시에도 동작하지만, 도메인 변경 시 환경변수만 바꾸면 됩니다.

---

## 배포

[Vercel](https://vercel.com)에 GitHub 연동 → push 자동 배포. 별도 설정 불필요.

빌드 명령: `npm run build` (sitemap 자동 생성)

---

## License

MIT (블로그 콘텐츠 제외 — 글은 저자 소유)
