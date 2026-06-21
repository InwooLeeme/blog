/**
 * About 페이지 데이터.
 */

/** 기술 스택 — 카테고리별 묶음 */
export type TechCategory = { category: string; items: string[] };

export const techStack: TechCategory[] = [
  { category: "Languages", items: ["C++", "TypeScript", "Python"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { category: "Tooling", items: ["Git", "Vercel"] },
];

/** 수상 이력 */
export type Award = { date: string; title: string; detail?: string };

export const awards: Award[] = [
  { date : "2024", title: "전남대학교 소프트웨어중심대학 제7회 SW프로그래밍 경진대회(호남•제주권)", detail: "장려상"},
  { date: "2024", title: "ICPC 전북대학교 예선 경시대회", detail: "금상" },
  { date: "2025", title: "ICPC 전북대학교 예선 경시대회", detail: "금상"},
  { date: "2025", title: "한국정보기술학회 하계종합학술대회 대학생 논문경진대회", detail: "우수논문상 · 「MCP 기반 PC용 개인 음성 비서 시스템 구축 방안」"}
];

/** 대회 참가 이력 */
export type Competition = { date: string; name: string; result?: string };

export const competitions: Competition[] = [
  { date: "2022", name: "UCPC 예선", result: "240th" },
  { date: "2024", name: "UCPC 예선", result: "132th" },
  { date: "2025", name: "UCPC 예선", result: "135th" }
];

/** 알고리즘 대회 출제 및 운영 */
export type ContestWork = { date: string; title: string; detail?: string };

export const contestWorks: ContestWork[] = [
  { date: "2024", title: "전북대학교 알고리즘 경진대회", detail: "출제 · 운영" },
  { date: "2025", title: "전북대학교 알고리즘 경진대회", detail: "출제 · 운영" },
  { date: "2026", title: "전북대학교 알고리즘 경진대회", detail: "출제 · 운영" }
];

/** 프로젝트 */
export type ProjectLink = {
  label: string;
  href: string;
  type?: "github" | "external";
};

export type Project = {
  name: string;
  subtitle?: string; // 도메인/한 줄 부제
  highlights: string[]; // 불릿 설명
  tech?: string[];
  links?: ProjectLink[];
};

export const projects: Project[] = [
  {
    name: "개인 알고리즘·기술 블로그",
    subtitle: "inwooleeme.vercel.app",
    highlights: [
      "Next.js + MDX를 활용한 알고리즘·개발 블로그 구축",
      "다크모드·스크롤 등장·페이지 전환 등 인터랙션 적용",
      "Vercel을 통한 정적 사이트 호스팅"
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MDX"],
    links: [
      { label: "GitHub", href: "https://github.com/InwooLeeme/blog", type: "github" },
      { label: "Page", href: "https://inwooleeme.vercel.app", type: "external" },
    ],
  },
  {
    name: "AI 포트폴리오 챗봇",
    subtitle: "portfolio-chatbot-six-theta.vercel.app",
    highlights: [
      "내 포트폴리오를 대화형으로 소개해 주는 챗봇을 만들어 보고 싶어서 시작한 프로젝트",
      "포트폴리오 내용을 미리 벡터로 저장해 두고, 질문이 들어오면 관련 부분을 찾아 Google Gemini가 답하도록 RAG로 구성했다 (LangChain.js 사용)",
      "이전 대화를 기억해서 후속 질문도 맥락을 이어 답하고, 답변은 한 글자씩 타이핑되듯 나오며 근거가 된 출처도 함께 보여준다",
      "물어볼 게 마땅치 않을 때를 위해 추천 질문도 띄워 둔다",
      "다른 사이트에 iframe으로 붙일 수 있게 만들었고, 부모 페이지의 다크/라이트 테마에 맞춰지고 지금 이 About 페이지에도 그렇게 들어가 있다",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "LangChain.js", "Google Gemini", "Upstash Redis"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/portfolio-chatbot",
        type: "github",
      },
      {
        label: "Page",
        href: "https://portfolio-chatbot-six-theta.vercel.app",
        type: "external",
      },
    ],
  },
  {
    name: "Daum 뉴스 크롤러",
    subtitle: "2024",
    highlights: [
      "Daum 뉴스 포털에서 기사 데이터를 수집하는 웹 스크래퍼",
      "기사 제목·본문·작성 시각·언론사·기자명 등 추출",
      "BeautifulSoup + requests 기반, 수집 데이터를 JSON으로 구조화",
    ],
    tech: ["Python", "BeautifulSoup", "requests"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/daum_news_crawling",
        type: "github",
      },
    ],
  },
  {
    name: "NASDAQ 주가 데이터 시각화",
    subtitle: "2024–2026 · 팀 프로젝트",
    highlights: [
      "데이터 베이스 수업 실습 프로젝트",
      "프론트엔드 개발을 주도적으로 담당 (React 기반 UI 구현)",
      "캔들스틱 차트로 NASDAQ 주가 데이터 시각화 — 2026년 ApexCharts→lightweight-charts(캔버스)로 교체, gzip·CDN 엣지 캐싱으로 응답 약 87% 감소",
      "입력한 기간·비율에 따라 FastAPI 백엔드와 연동해 차트 렌더링",
      "2026: 개인 작업으로 백엔드를 API 전용으로 분리하고 프론트엔드를 Vercel에 배포",
      "2026: 코사인·피어슨 유사도로 기준 구간과 닮은 과거 구간을 찾는 유사 패턴 분석 추가",
    ],
    tech: ["React", "JavaScript", "lightweight-charts", "FastAPI", "Sqlite", "Vercel"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/database-nasdaq",
        type: "github",
      },
      {
        label: "Page",
        href: "https://database-nasdaq-dyb7.vercel.app/",
        type: "external"
      }
    ],
  },
  // TODO: 다른 프로젝트 추가
];

/** 자격증 — nameEn은 선택(영문명) */
export type Certification = {
  date: string;
  name: string;
  nameEn?: string;
  issuer?: string;
};

export const certifications: Certification[] = [
  {
    date: "2025.10.31",
    name: "한국사능력검정시험 1급",
    nameEn: "Korean History Proficiency Test (Advanced Level, Grade 1)",
    issuer: "국사편찬위원회",
  },
  {
    date: "2025.12.24",
    name: "정보처리기사",
    issuer: "한국산업인력공단",
  },
  {
    date: "2026.03.06",
    name: "데이터분석 준전문가 ADsP",
    nameEn: "Advanced Data Analytics Semi-Professional",
    issuer: "한국데이터산업진흥원",
  },
];
