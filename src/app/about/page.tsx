import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import AboutPageContent from "../components/about/AboutPageContent";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.author} 소개 — 기술 스택, 수상 이력, 대회 참가, 프로젝트, 자격증`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
