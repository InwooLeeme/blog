/**
 * About 페이지 데이터 — 영어판. 구조는 about.ts(한국어판)와 1:1 대응.
 */

import type {
  Award,
  Certification,
  Competition,
  ContestWork,
  Education,
  Project,
  TechLevel,
  WorkingStyle,
} from "./about";

export const aboutSummary = [
  "I enjoy solving algorithm problems and bring that way of thinking to web and AI tool development.",
  "I build Next.js-based services and MCP/LLM agent projects.",
  "I care about performance, automation, and writing down what I learn.",
] as const;

export const currentStatus = "B.S. in Software Engineering, JBNU (Aug 2026)";

export const techLevelLabels: Record<TechLevel, string> = {
  main: "Primary",
  used: "Hands-on",
  learning: "Exploring",
};

export const education: Education[] = [
  { date: "2026.07–present", title: "SK SKALA" },
  {
    date: "2024.03–2025.12",
    title: "Jeonbuk National University Algorithm Club ALPS",
    detail: "Weekly algorithm study and problem solving; preparing for coding tests and algorithm contests",
  },
  { date: "2019.03–2026.08", title: "Jeonbuk National University, Dept. of Software Engineering" },
];

export const awards: Award[] = [
  {
    date: "2025",
    title: "KIIT Summer Conference Undergraduate Paper Competition",
    detail: "Best Paper Award · “Building an MCP-based Personal Voice Assistant System for PC”",
    link: { label: "Related project post", href: "/blog/mcp_assistant" },
  },
  {
    date: "2025",
    title: "ICPC Jeonbuk National University Preliminary Contest",
    detail: "Gold Prize · Participated again following the previous year",
  },
  {
    date: "2024",
    title: "ICPC Jeonbuk National University Preliminary Contest",
    detail: "Gold Prize · Team-based algorithm contest",
  },
  {
    date: "2024",
    title: "7th SW Programming Contest, Chonnam National University SW-Centered University (Honam·Jeju)",
    detail: "Encouragement Award · Regional contest evaluating algorithmic problem-solving",
  },
];

export const competitions: Competition[] = [
  {
    date: "2025",
    name: "UCPC Preliminary",
    result: "135th · A contest I keep coming back to",
  },
  {
    date: "2024",
    name: "UCPC Preliminary",
    result: "132nd · Expanding team contest experience",
  },
  {
    date: "2022",
    name: "UCPC Preliminary",
    result: "240th · Algorithm contest participation record",
  },
];

export const contestWorks: ContestWork[] = [
  {
    date: "2026",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Reviewing constraints, edge cases, judge data, and overall difficulty",
  },
  {
    date: "2025",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Reviewing constraints, edge cases, and judge data",
  },
  {
    date: "2024",
    title: "Jeonbuk National University Algorithm Contest",
    detail: "Problem setting · Operations · Balancing solvable difficulty with verifiable solutions",
  },
];

export const projects: Project[] = [
  {
    name: "MCP Assistant",
    meta: "2025–2026 · Capstone → personal upgrade",
    highlights: [
      "MCP-based PC control agent — an LLM interprets natural-language commands and actually operates the OS",
      "Separates decision-making (Agent) from execution (MCP servers) — the servers are reusable from other clients",
      "App launch, URL/YouTube playback, media control, and folder open extend via mcp_servers.json registration alone; progress streams over SSE",
      "Simplified a planner/executor/selector three-stage loop to a single planner run — the order was always fixed, so asking the LLM each turn was unnecessary; Gemini calls dropped from 3 to 1 per command",
      "Introduced McpPool to cache server connections and tool routing, established once at app startup",
      "Found that tool responses accumulate in conversation history and can be mistaken for instructions in later planning; added prompt-injection safeguards to the planner prompt",
      "Packaged as a desktop app with Tauri + PyInstaller; added sidebar-based conversation memory",
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
    name: "NASDAQ Stock Data Visualization",
    meta: "2024–2026 · Team project",
    highlights: [
      "Web service visualizing 11,125 NASDAQ daily candles — started as a database course project; owned the React frontend",
      "Chose gzip compression over truncating data — kept the core feature while cutting API responses from 1.99MB to 263KB and response time from ~2s to 0.15–0.49s",
      "Chose CDN edge caching over in-memory caching, which would not survive serverless cold starts — after the first request the backend is bypassed entirely",
      "ApexCharts renders one SVG element per candle and was structurally slow past 10,000 → replaced with canvas-based lightweight-charts, which also cut the JS bundle from 183KB to 99KB (gzip)",
      "Added similar-pattern analysis finding past ranges that resemble a reference range via cosine/Pearson similarity",
      "Split the backend into an API-only service and deployed the frontend to Vercel",
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
    image: "https://inwooleeme.github.io/assets/projects/database-nasdaq-page.png",
    accent: "#059669",
  },
  {
    name: "Developer Income Analysis Pipeline",
    meta: "2026 · 6-person team project",
    highlights: [
      "End-to-end data analysis pipeline testing whether developers favorable toward AI tools earn differently, using the Stack Overflow 2024 Developer Survey",
      "Automated eight stages as scripts: loading, preprocessing, descriptive stats, visualization, hypothesis testing, regression, cross-validation, and report generation",
      "Tested the salary gap with Welch's t-test (α=0.05) and Cohen's d, then isolated the effect of AI sentiment via RidgeCV multivariate regression controlling for country, experience, role, education, org size, remote work, and age",
      "Benchmarked Pandas vs Polars on loading/filtering/aggregation in stage 0, and validated that both libraries agree (shape, missing values) in stage 1",
      "Auto-generated static Seaborn charts, interactive Plotly charts, trained models (.joblib), and a report.md analysis report",
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
    name: "AI Portfolio Chatbot",
    meta: "2026",
    highlights: [
      "RAG chatbot that introduces my portfolio conversationally (LangChain.js + Google Gemini)",
      "Pre-embeds portfolio content as vectors and retrieves the relevant parts to generate answers",
      "Retains context across follow-up questions; streams answers and shows the cited sources",
      "Offers suggested questions for visitors unsure what to ask",
      "Built as a first-party loader embeddable on other sites — a site-wide floating button opens it in a modal",
      "Syncs with the parent page's dark/light theme in real time via postMessage, no reload required",
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
    name: "Personal Algorithm & Dev Blog",
    meta: "2025–present",
    highlights: [
      "Algorithm and dev blog built with Next.js + MDX",
      "Improved mobile Lighthouse Performance from 74 to 95 (LCP 12.2s → 2.9s, transfer 1.95MB → 361KB)",
      "Misdiagnosed a canvas animation as the bottleneck; an actual trace showed the real cause was a site-wide font preload",
      "Dark mode, scroll reveal, and page transition interactions",
      "Static hosting on Vercel",
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
    date: "2026.03.06",
    name: "ADsP (Advanced Data Analytics Semi-Professional)",
    issuer: "Korea Data Agency",
  },
  {
    date: "2025.12.24",
    name: "Engineer Information Processing",
    issuer: "Human Resources Development Service of Korea",
  },
  {
    date: "2025.10.31",
    name: "Korean History Proficiency Test (Advanced Level, Grade 1)",
    issuer: "National Institute of Korean History",
  },
];
