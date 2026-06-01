/**
 * About 페이지 데이터.
 */

/** 기술 스택 — 카테고리별 묶음 */
export type TechCategory = { category: string; items: string[] };

export const techStack: TechCategory[] = [
  { category: "Languages", items: ["C++", "TypeScript", "Python"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { category: "Tooling", items: ["Git", "Vercel", "VS Code"] },
];

/** 수상 이력 */
export type Award = { date: string; title: string; detail?: string };

export const awards: Award[] = [
  { date : "2024", title: "전남대학교 소프트웨어중심대학 제7회 SW프로그래밍 경진대회(호남•제주권)", detail: "장려상"},
  { date: "2024", title: "ICPC 전북대학교 예선 경시대회", detail: "금상" },
  { date: "2025", title: "ICPC 전북대학교 예선 경시대회", detail: "금상"},
];

/** 대회 참가 이력 */
export type Competition = { date: string; name: string; result?: string };

export const competitions: Competition[] = [
  { date: "2022", name: "UCPC 예선", result: "240th" },
  { date: "2024", name: "UCPC 에선", result: "132th" },
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
export type Project = {
  name: string;
  description: string;
  tech?: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    name: "개인 기술 블로그",
    description: "Next.js + MDX 기반 알고리즘·개발 블로그. 동적 OG 이미지, RSS, 커스텀 MDX 컴포넌트 등을 직접 구현.",
    tech: ["Next.js", "TypeScript", "MDX", "Tailwind CSS"],
    href: "https://github.com/InwooLeeme/blog",
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
