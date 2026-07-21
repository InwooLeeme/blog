/**
 * About 페이지 데이터 — 영어판. 구조는 about.ts(한국어판)와 1:1 대응.
 */

import type {
  Award,
  Certification,
  Competition,
  ContestWork,
  Project,
  TechLevel,
  WorkingStyle,
} from "./about";

export const aboutSummary = [
  "I enjoy solving algorithm problems and bring that way of thinking to web and AI tool development.",
  "I build Next.js-based services and MCP/LLM agent projects.",
  "I care about performance, automation, and writing down what I learn.",
] as const;

export const techLevelLabels: Record<TechLevel, string> = {
  main: "Primary",
  used: "Hands-on",
  learning: "Exploring",
};

export const awards: Award[] = [
  {
    date: "2024",
    title: "7th SW Programming Contest, Chonnam National University SW-Centered University (Honam·Jeju)",
    detail: "Encouragement Award · Regional contest evaluating algorithmic problem-solving",
  },
  {
    date: "2024",
    title: "ICPC Jeonbuk National University Preliminary Contest",
    detail: "Gold Prize · Team-based algorithm contest",
  },
  {
    date: "2025",
    title: "ICPC Jeonbuk National University Preliminary Contest",
    detail: "Gold Prize · Participated again following the previous year",
  },
  {
    date: "2025",
    title: "KIIT Summer Conference Undergraduate Paper Competition",
    detail: "Best Paper Award · “Building an MCP-based Personal Voice Assistant System for PC”",
    link: { label: "Related project post", href: "/blog/mcp_assistant" },
  },
];

export const competitions: Competition[] = [
  {
    date: "2022",
    name: "UCPC Preliminary",
    result: "240th · Algorithm contest participation record",
  },
  {
    date: "2024",
    name: "UCPC Preliminary",
    result: "132nd · Expanding team contest experience",
  },
  {
    date: "2025",
    name: "UCPC Preliminary",
    result: "135th · A contest I keep coming back to",
  },
];

export const contestWorks: ContestWork[] = [
  {
    date: "2024",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Balancing solvable difficulty with verifiable solutions",
  },
  {
    date: "2025",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Reviewing constraints, edge cases, and judge data",
  },
  {
    date: "2026",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Reviewing constraints, edge cases, judge data, and overall difficulty",
  },
];

export const projects: Project[] = [
  {
    name: "Personal Algorithm & Dev Blog",
    meta: "2025–present",
    highlights: [
      "Built an algorithm/dev blog with Next.js + MDX",
      "Interactions like dark mode, scroll reveals, and page transitions",
      "Static site hosting on Vercel",
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
    name: "AI Portfolio Chatbot",
    meta: "2026",
    highlights: [
      "Started from wanting a chatbot that introduces my portfolio conversationally",
      "RAG setup: portfolio content pre-embedded as vectors, relevant chunks retrieved and answered by Google Gemini (built with LangChain.js)",
      "Remembers previous turns to answer follow-ups in context; answers stream in with a typing effect along with cited sources",
      "Shows suggested questions for when you're not sure what to ask",
      "Built as a first-party loader embeddable on other sites — a site-wide floating button opens it in a modal, as on this blog",
      "Matches the parent page's dark/light theme in real time via postMessage, no reload needed",
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
    name: "Daum News Crawler",
    meta: "2024",
    highlights: [
      "A web scraper collecting article data from the Daum news portal",
      "Extracts title, body, timestamp, outlet, and reporter name",
      "BeautifulSoup + requests; structures collected data as JSON",
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
  {
    name: "NASDAQ Stock Data Visualization",
    meta: "2024–2026 · Team project",
    highlights: [
      "Hands-on project for a database course",
      "Led the frontend development (React-based UI)",
      "Candlestick chart of NASDAQ data — replaced ApexCharts with lightweight-charts (canvas) in 2026; gzip + CDN edge caching cut responses by ~87%",
      "Renders charts through a FastAPI backend based on the selected period and ratio",
      "2026: split the backend into an API-only service and deployed the frontend to Vercel",
      "2026: added similar-pattern analysis that finds past ranges resembling a reference range via cosine/Pearson similarity",
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
        type: "external",
      },
    ],
    image: "https://inwooleeme.github.io/assets/projects/Nasdaq_Thumbnail.png",
    accent: "#059669",
  },
  {
    name: "MCP Assistant",
    meta: "2025–2026 · Capstone → personal upgrade",
    highlights: [
      "An MCP-based PC voice assistant from my 2025 capstone project, rebuilt as text-based in 2026",
      "Say things like “open KakaoTalk” or “play café music” and the LLM understands and actually operates the PC",
      "Separates the LLM decision layer (Agent) from the OS layer (MCP servers) — the servers are reusable from other clients as-is",
      "Tools like app launch, URL/YouTube playback, media control, and folder open extend via mcp_servers.json registration alone; progress streams in real time over SSE",
      "2026: simplified to a single planner run, cutting Gemini calls from 3 to 1 per command; cached server connections with McpPool to reduce latency · added prompt-injection safeguards",
      "2026: added multi-conversation memory managed from a sidebar, and packaged as a desktop app with Tauri + PyInstaller",
    ],
    tech: ["Next.js", "TypeScript", "Tauri", "Rust", "FastAPI", "Python", "AutoGen", "Google Gemini", "yt-dlp"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/InwooLeeme/mcp-assistant",
        type: "github",
      },
      {
        label: "View paper",
        href: "https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12288718",
        type: "external",
      },
    ],
    image: "https://inwooleeme.github.io/assets/projects/mcp_assistant_demo.png",
    accent: "#0891b2",
  },
  {
    name: "Developer Income Analysis Pipeline",
    meta: "2026 · 6-person team project",
    highlights: [
      "End-to-end data analysis pipeline testing whether developers favorable toward AI tools earn differently, using the Stack Overflow 2024 Developer Survey",
      "Automated 8 stages as scripts: loading, preprocessing, descriptive stats, visualization, hypothesis testing, regression, cross-validation, and report generation",
      "Tested the salary gap between groups with Welch's t-test (α=0.05) and Cohen's d, then isolated the effect of AI sentiment itself via RidgeCV multivariate regression controlling for country, experience, role, education, org size, remote work, and age",
      "Stage 0 benchmarks Pandas vs Polars on loading/filtering/aggregation; stage 1 validates that both libraries agree (shape, missing values)",
      "Auto-generates static Seaborn charts, interactive Plotly charts, trained models (.joblib), and a `report.md` analysis report",
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
];

export const workingStyles: WorkingStyle[] = [
  {
    title: "Break problems down and verify",
    detail:
      "I turn fuzzy complaints like “slow” or “clunky” into measurable units — response size, call counts, rendering strategy.",
  },
  {
    title: "Bring algorithmic thinking to implementation",
    detail:
      "I lay out conditions and edge cases first, then look for options that reduce the bottleneck — data structures, caching, and the like.",
  },
  {
    title: "Write down the process",
    detail:
      "Rather than keeping only the finished result, I record why I changed things, what failed, and what to fix next.",
  },
];

export const certifications: Certification[] = [
  {
    date: "2025.10.31",
    name: "Korean History Proficiency Test (Advanced Level, Grade 1)",
    issuer: "National Institute of Korean History",
  },
  {
    date: "2025.12.24",
    name: "Engineer Information Processing",
    issuer: "Human Resources Development Service of Korea",
  },
  {
    date: "2026.03.06",
    name: "ADsP (Advanced Data Analytics Semi-Professional)",
    issuer: "Korea Data Agency",
  },
];
