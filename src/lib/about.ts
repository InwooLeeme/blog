/**
 * About 페이지 데이터.
 */

export const aboutSummary = [
  "알고리즘 문제 해결을 좋아하고, 그 사고방식을 웹/AI 도구 개발에 적용합니다.",
  "Next.js 기반 서비스와 MCP/LLM 에이전트 프로젝트를 만들고 있습니다.",
  "성능 개선, 자동화, 지식 기록에 관심이 많습니다.",
] as const;

/** 히어로 하단에 노출하는 현재 상태 한 줄 */
export const currentStatus = "2026.08 전북대학교 소프트웨어공학과 졸업";

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
  type?: "github" | "external";
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
      "2025년 캡스톤 프로젝트로 시작한 MCP 기반 PC 음성 비서를 2026년에 텍스트 기반으로 재구축한 프로젝트",
      "\"카카오톡 실행해 줘\", \"카페 음악 재생해 줘\" 같은 말을 하면 LLM이 알아듣고 실제로 PC를 조작해 준다",
      "LLM이 판단하는 부분(Agent)과 OS를 직접 건드리는 부분(MCP 서버)을 분리 — MCP 서버는 다른 클라이언트에서도 그대로 재사용할 수 있다",
      "프로그램 실행·URL/유튜브 재생·미디어 제어·폴더 열기 같은 도구를 mcp_servers.json 등록만으로 확장할 수 있고, 처리 과정은 SSE로 실시간 스트리밍된다",
      "2026: planner 단독 실행으로 구조를 단순화해 명령당 Gemini 호출을 3회→1회로 줄이고, `McpPool`로 서버 접속을 캐싱해 응답 지연을 줄였다 · 프롬프트 인젝션 안전장치도 추가",
      "2026: 사이드바에서 여러 대화를 관리하며 맥락을 이어가는 대화 기억 기능 추가, Tauri + PyInstaller로 데스크톱 앱 패키징",
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
    ],
    image: "https://inwooleeme.github.io/assets/projects/mcp_assistant_demo.png",
    accent: "#0891b2",
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
    image: "https://inwooleeme.github.io/assets/projects/database-nasdaq-page.png",
    accent: "#059669",
  },
  {
    name: "개발자 소득 분석 파이프라인",
    meta: "2026 · 6인 팀 프로젝트",
    highlights: [
      "Stack Overflow 2024 개발자 설문 데이터로 \"AI 도구에 우호적인 개발자는 연봉이 다른가\"를 검증한 End-to-End 데이터 분석 파이프라인",
      "데이터 로딩·전처리·기술통계·시각화·가설검정·회귀·교차검증·리포트 생성까지 8단계를 스크립트로 자동화했다",
      "Welch's t-test(α=0.05)와 Cohen's d로 두 집단의 연봉 차이를 검정하고, RidgeCV 다변량 회귀로 국가·경력·직군·학력·조직 규모·재택 여부·나이를 통제해 AI 태도 자체의 효과를 분리했다",
      "0단계에서 Pandas와 Polars의 로딩·필터링·집계 성능을 벤치마크하고, 1단계에서 두 라이브러리의 결과가 일치하는지(shape·결측치) 검증한다",
      "Seaborn 정적 차트와 Plotly 인터랙티브 차트, 학습된 모델(.joblib), 분석 리포트(report.md)를 산출물로 자동 생성한다",
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
    accent: "#7c3aed",
  },
  {
    name: "개인 알고리즘·기술 블로그",
    meta: "2025–현재",
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
