/**
 * About 페이지 데이터.
 */

export const aboutSummary = [
  "알고리즘 문제 해결을 좋아하고, 그 사고방식을 웹/AI 도구 개발에 적용합니다.",
  "Next.js 기반 서비스와 MCP/LLM 에이전트 프로젝트를 만들고 있습니다.",
  "성능 개선, 자동화, 지식 기록에 관심이 많습니다.",
] as const;

/** 기술 스택 — 카테고리별 묶음 */
export type TechLevel = "main" | "used" | "learning";
export type TechItem = { name: string; level: TechLevel };
export type TechCategory = { category: string; items: TechItem[] };

export const techLevelLabels: Record<TechLevel, string> = {
  main: "주력",
  used: "실전 사용",
  learning: "탐색",
};

export const techStack: TechCategory[] = [
  {
    category: "Languages",
    items: [
      { name: "C++", level: "main" },
      { name: "TypeScript", level: "main" },
      { name: "JavaScript", level: "used" },
      { name: "Python", level: "used" },
      { name: "Rust", level: "learning" },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React", level: "main" },
      { name: "Next.js", level: "main" },
      { name: "Tailwind CSS", level: "used" },
      { name: "MDX", level: "used" },
      { name: "lightweight-charts", level: "used" },
      { name: "Tauri", level: "learning" },
    ],
  },
  {
    category: "Backend · AI",
    items: [
      { name: "FastAPI", level: "used" },
      { name: "SQLite", level: "used" },
      { name: "LangChain.js", level: "used" },
      { name: "AutoGen", level: "learning" },
      { name: "Google Gemini", level: "used" },
    ],
  },
  {
    category: "Data",
    items: [
      { name: "Pandas", level: "learning" },
      { name: "Polars", level: "learning" },
      { name: "scikit-learn", level: "learning" },
    ],
  },
  {
    category: "Tooling",
    items: [
      { name: "Git", level: "used" },
      { name: "Vercel", level: "used" },
    ],
  },
];

/** 학력·활동 */
export type TimelineLink = { label: string; href: string };
export type Education = { date: string; title: string; detail?: string; link?: TimelineLink };

export const education: Education[] = [
  { date: "2026.07–현재", title: "SK SKALA" },
  {
    date: "2024.03–2025.12",
    title: "전북대학교 알고리즘 동아리 ALPS",
    detail: "매주 알고리즘 학습 및 문제 풀이, 코딩테스트 및 알고리즘 대회 대비",
  },
  { date: "2019.03–2026.08", title: "전북대학교 소프트웨어공학과" },
];

/** 수상 이력 */
export type Award = { date: string; title: string; detail?: string; link?: TimelineLink };

export const awards: Award[] = [
  {
    date: "2025",
    title: "한국정보기술학회 하계종합학술대회 대학생 논문경진대회",
    detail: "우수논문상 · 「MCP 기반 PC용 개인 음성 비서 시스템 구축 방안」",
    link: { label: "관련 프로젝트 글", href: "/blog/mcp_assistant" },
  },
  {
    date: "2025",
    title: "ICPC 전북대학교 예선 경시대회",
    detail: "금상 · 전년도에 이어 참가"
  },
  {
    date: "2024",
    title: "ICPC 전북대학교 예선 경시대회",
    detail: "금상 · 팀 기반 알고리즘 경시대회"
  },
  {
    date : "2024",
    title: "전남대학교 소프트웨어중심대학 제7회 SW프로그래밍 경진대회(호남•제주권)",
    detail: "장려상 · 알고리즘 문제 해결 역량을 평가받은 권역 대회"
  }
];

/** 대회 참가 이력 */
export type Competition = { date: string; name: string; result?: string; link?: TimelineLink };

export const competitions: Competition[] = [
  {
    date: "2025",
    name: "UCPC 예선",
    result: "135th · 꾸준히 참가한 알고리즘 대회"
  },
  {
    date: "2024",
    name: "UCPC 예선",
    result: "132nd · 팀 대회 경험 확장"
  },
  {
    date: "2022",
    name: "UCPC 예선",
    result: "240th · 알고리즘 대회 참가 기록"
  }
];

/** 알고리즘 대회 출제 및 운영 */
export type ContestWork = { date: string; title: string; detail?: string; link?: TimelineLink };

export const contestWorks: ContestWork[] = [
  {
    date: "2026",
    title: "전북대학교 알고리즘 경진대회",
    detail: "출제 · 운영 · 문제 조건, 예외 케이스, 채점 데이터, 대회 난이도 검토",
  },
  {
    date: "2025",
    title: "전북대학교 알고리즘 경진대회",
    detail: "출제 · 운영 · 문제 조건, 예외 케이스, 채점 데이터 검토",
  },
  {
    date: "2024",
    title: "전북대학교 알고리즘 경진대회",
    detail: "출제 · 운영 · 참가자가 풀 수 있는 난이도와 검증 가능한 풀이를 함께 고민",
  }
];

/** 프로젝트 */
export type ProjectLink = {
  label: string;
  href: string;
  type?: "github" | "external" | "post"; // post = 사이트 내부 블로그 글
};

export type Project = {
  name: string;
  meta?: string; // 연도·구분 등 작은 메타 텍스트 (링크와 중복되는 URL은 넣지 않음)
  highlights: string[]; // 불릿 설명
  tech?: string[];
  links?: ProjectLink[];
  image?: string; // 카드 상단 커버 이미지 (없으면 accent 그라디언트로 대체)
  accent?: string; // 카드 시그니처 색 (hex)
};

export const projects: Project[] = [
  {
    name: "MCP Assistant",
    meta: "2025–2026 · 캡스톤 → 개인 업그레이드",
    highlights: [
      "MCP 기반 PC 제어 에이전트 — 자연어 명령을 LLM이 해석해 실제 OS 조작 수행",
      "판단(Agent)과 실행(MCP 서버) 분리 — 서버는 다른 클라이언트에서도 재사용 가능",
      "프로그램 실행·URL/유튜브 재생·미디어 제어·폴더 열기를 mcp_servers.json 등록만으로 확장, 처리 과정은 SSE로 실시간 스트리밍",
      "planner·executor·selector 3단계에서 planner 단독 실행으로 단순화 — 순서가 고정된 구간에 매번 LLM을 물을 필요가 없다고 판단, 명령당 Gemini 호출 3회→1회 감소",
      "McpPool 도입으로 서버 접속·도구 라우팅을 앱 기동 시 1회만 수행하도록 캐싱",
      "도구 응답이 대화 기록에 누적돼 다음 계획에 지시처럼 오인될 수 있음을 확인, planner 프롬프트에 프롬프트 인젝션 방어 추가",
      "Tauri + PyInstaller 데스크톱 패키징, 사이드바 기반 대화 기억 기능 추가",
    ],
    tech: ["Next.js", "TypeScript", "Tauri", "Rust", "FastAPI", "Python", "AutoGen", "Google Gemini", "yt-dlp"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/mcp-assistant",
        type: "github",
      },
      {
        label: "논문 보기",
        href: "https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12288718",
        type: "external",
      },
      { label: "구현 기록", href: "/blog/mcp_assistant", type: "post" },
    ],
    image: "https://inwooleeme.github.io/assets/projects/mcp_assistant_demo.png",
    accent: "#0891b2",
  },
  {
    name: "NASDAQ 주가 데이터 시각화",
    meta: "2024–2026 · 팀 프로젝트",
    highlights: [
      "나스닥 일봉 11,125개를 캔들스틱으로 시각화하는 웹 서비스 — 데이터베이스 수업 실습으로 시작, React 기반 프론트엔드 담당",
      "데이터 절단 대신 gzip 압축을 선택 — 핵심 기능을 유지하면서 API 응답 1.99MB→263KB, 응답 시간 약 2초→0.15~0.49초로 개선",
      "서버리스 콜드 스타트가 남는 메모리 캐시 대신 CDN 엣지 캐싱을 선택, 첫 요청 이후 백엔드를 거치지 않도록 구성",
      "ApexCharts는 캔들마다 SVG 엘리먼트를 생성해 1만 개 이상에서 구조적으로 느림 → 캔버스 기반 lightweight-charts로 교체, JS 번들 183KB→99KB(gzip) 동반 감소",
      "코사인·피어슨 유사도로 기준 구간과 닮은 과거 구간을 찾는 패턴 분석 추가",
      "백엔드를 API 전용으로 분리하고 프론트엔드를 Vercel에 배포",
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
      },
      { label: "개선 기록", href: "/blog/nasdaq_pattern_chart", type: "post" },
    ],
    image: "https://inwooleeme.github.io/assets/projects/database-nasdaq-page.png",
    accent: "#059669",
  },
  {
    name: "개발자 소득 분석 파이프라인",
    meta: "2026 · 6인 팀 프로젝트",
    highlights: [
      "Stack Overflow 2024 개발자 설문으로 \"AI 도구에 우호적인 개발자는 연봉이 다른가\"를 검증한 End-to-End 데이터 분석 파이프라인",
      "데이터 로딩·전처리·기술통계·시각화·가설검정·회귀·교차검증·리포트 생성 8단계 스크립트 자동화",
      "Welch's t-test(α=0.05)와 Cohen's d로 집단 간 연봉 차이 검정, RidgeCV 다변량 회귀로 국가·경력·직군·학력·조직 규모·재택·나이를 통제해 AI 태도의 효과 분리",
      "0단계에서 Pandas·Polars 로딩/필터링/집계 성능 벤치마크, 1단계에서 두 라이브러리 결과 일치 검증(shape·결측치)",
      "Seaborn 정적 차트, Plotly 인터랙티브 차트, 학습 모델(.joblib), 분석 리포트(report.md) 자동 생성",
    ],
    tech: ["Python", "Pandas", "Polars", "scikit-learn", "SciPy", "Seaborn", "Plotly", "pytest", "Ruff"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/adult-income-analysis-pipeline",
        type: "github",
      },
    ],
    accent: "#2563eb",
  },
  {
    name: "AI 포트폴리오 챗봇",
    meta: "2026",
    highlights: [
      "포트폴리오를 대화형으로 소개하는 RAG 챗봇 (LangChain.js + Google Gemini)",
      "포트폴리오 내용을 벡터로 사전 저장하고, 질문과 관련된 부분을 검색해 답변 생성",
      "이전 대화를 기억해 후속 질문의 맥락 유지, 답변 스트리밍 및 근거 출처 표시",
      "질문거리가 없을 때를 위한 추천 질문 제공",
      "다른 사이트에 임베드 가능한 first-party 로더로 구현 — 사이트 전역 플로팅 버튼으로 모달 오픈",
      "부모 페이지의 다크/라이트 테마를 postMessage로 수신해 새로고침 없이 실시간 동기화",
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
    accent: "#7c3aed",
  },
  {
    name: "개인 알고리즘·기술 블로그",
    meta: "2025–현재",
    highlights: [
      "Next.js + MDX 기반 알고리즘·개발 블로그 구축",
      "Lighthouse 모바일 Performance 74→95점 개선 (LCP 12.2초→2.9초, 전송량 1.95MB→361KB)",
      "캔버스 애니메이션을 병목으로 오진했으나 실제 트레이스 측정으로 전역 폰트 preload가 원인임을 확인해 수정",
      "다크모드·스크롤 등장·페이지 전환 인터랙션 적용",
      "Vercel 정적 호스팅",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MDX"],
    links: [
      { label: "GitHub", href: "https://github.com/InwooLeeme/blog", type: "github" },
      { label: "Page", href: "https://inwooleeme.vercel.app", type: "external" },
      { label: "성능 개선 기록", href: "/blog/lighthouse_mobile_performance", type: "post" },
      { label: "404 디버깅 기록", href: "/blog/nextjs_dynamic_params_decoding", type: "post" },
    ],
    image: "https://inwooleeme.github.io/assets/projects/BlogThumbnail.png",
    accent: "#f43f5e",
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
    accent: "#d97706",
  },
];

export type WorkingStyle = {
  title: string;
  detail: string;
};

export const workingStyles: WorkingStyle[] = [
  {
    title: "문제를 작게 쪼개고 검증합니다",
    detail: "느리다, 불편하다 같은 감각적인 문제를 응답 크기, 호출 횟수, 렌더링 방식처럼 확인 가능한 단위로 나눕니다.",
  },
  {
    title: "알고리즘식 사고를 구현에 가져옵니다",
    detail: "조건과 예외를 먼저 정리하고, 자료구조나 캐싱처럼 문제의 병목을 줄이는 선택지를 찾는 편입니다.",
  },
  {
    title: "만든 과정을 글로 남깁니다",
    detail: "완성된 결과만 남기기보다 왜 바꿨는지, 무엇이 실패했는지, 다음에 무엇을 고칠지까지 기록하려고 합니다.",
  },
];

/** 자격증 — nameEn은 선택(영문명) */
export type Certification = {
  date: string;
  name: string;
  nameEn?: string;
  issuer?: string;
  link?: TimelineLink;
};

export const certifications: Certification[] = [
  {
    date: "2026.03.06",
    name: "데이터분석 준전문가 ADsP",
    nameEn: "Advanced Data Analytics Semi-Professional",
    issuer: "한국데이터산업진흥원",
  },
  {
    date: "2025.12.24",
    name: "정보처리기사",
    issuer: "한국산업인력공단",
  },
  {
    date: "2025.10.31",
    name: "한국사능력검정시험 1급",
    nameEn: "Korean History Proficiency Test (Advanced Level, Grade 1)",
    issuer: "국사편찬위원회",
  },
];
