/**
 * About 페이지 데이터.
 */

/** 기술 스택 — 카테고리별 묶음 */
export type TechCategory = { category: string; items: string[] };

export const techStack: TechCategory[] = [
  { category: "Languages", items: ["C++", "TypeScript", "Python"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { category: "Backend · AI", items: ["FastAPI", "SQLite", "LangChain.js", "AutoGen", "Google Gemini"] },
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
  meta?: string; // 연도·구분 등 작은 메타 텍스트 (링크와 중복되는 URL은 넣지 않음)
  highlights: string[]; // 불릿 설명
  tech?: string[];
  links?: ProjectLink[];
};

export const projects: Project[] = [
  {
    name: "개인 알고리즘·기술 블로그",
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
    highlights: [
      "내 포트폴리오를 대화형으로 소개해 주는 챗봇을 만들어 보고 싶어서 시작한 프로젝트",
      "포트폴리오 내용을 미리 벡터로 저장해 두고, 질문이 들어오면 관련 부분을 찾아 Google Gemini가 답하도록 RAG로 구성했다 (LangChain.js 사용)",
      "이전 대화를 기억해서 후속 질문도 맥락을 이어 답하고, 답변은 한 글자씩 타이핑되듯 나오며 근거가 된 출처도 함께 보여준다",
      "물어볼 게 마땅치 않을 때를 위해 추천 질문도 띄워 둔다",
      "다른 사이트에 붙일 수 있는 first-party 로더로 만들었고, 사이트 전역에 떠 있는 플로팅 버튼을 누르면 모달로 열린다 — 지금 이 블로그에도 그렇게 들어가 있다",
      "부모 페이지의 다크/라이트 테마를 postMessage로 받아 새로고침 없이 실시간으로 맞춘다",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "LangChain.js", "Google Gemini"],
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
    meta: "2024",
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
    meta: "2024–2026 · 팀 프로젝트",
    highlights: [
      "데이터 베이스 수업 실습 프로젝트",
      "프론트엔드 개발을 주도적으로 담당 (React 기반 UI 구현)",
      "캔들스틱 차트로 NASDAQ 주가 데이터 시각화 — 2026년 ApexCharts→lightweight-charts(캔버스)로 교체, gzip·CDN 엣지 캐싱으로 응답 약 87% 감소",
      "입력한 기간·비율에 따라 FastAPI 백엔드와 연동해 차트 렌더링",
      "2026: 개인 작업으로 백엔드를 API 전용으로 분리하고 프론트엔드를 Vercel에 배포",
      "2026: 코사인·피어슨 유사도로 기준 구간과 닮은 과거 구간을 찾는 유사 패턴 분석 추가",
    ],
    tech: ["React", "JavaScript", "lightweight-charts", "FastAPI", "SQLite", "Vercel"],
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
  {
    name: "MCP Assistant",
    meta: "2025 캡스톤 → 2026 개인 업그레이드",
    highlights: [
      "2025년 전북대 캡스톤 프로젝트로 시작한 MCP 기반 PC 비서를 2026년에 내 방식대로 다시 뜯어고쳤다 — \"카카오톡 실행해 줘\", \"카페 음악 재생해 줘\" 같은 말을 하면 LLM이 알아듣고 실제로 PC를 조작해 준다",
      "LLM이 판단하는 부분(Agent)과 OS를 직접 건드리는 부분(MCP 서버)을 분리했다 — Agent는 뭘 할지 계획만 세우고 실행은 MCP 서버가 맡아서, MCP 서버는 다른 클라이언트에서도 그대로 재사용할 수 있다",
      "프로그램 실행·URL/유튜브 재생·미디어 제어·폴더 열기 같은 도구를 만들어 뒀고, mcp_servers.json에 새 서버만 등록하면 비서가 그 도구를 바로 쓸 수 있도록 확장 구조를 잡았다",
      "명령을 처리하는 동안 진행 상황과 결과를 SSE로 흘려보내서 화면에서 실시간으로 확인할 수 있게 했다",
    ],
    tech: ["Next.js", "TypeScript", "FastAPI", "Python", "AutoGen", "Google Gemini"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/mcp-assistant",
        type: "github",
      },
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
