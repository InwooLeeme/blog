import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import AboutPageContent from "../components/about/AboutPageContent";
import JsonLd from "../components/JsonLd";
import MotionProvider from "../components/MotionProvider";
import { buildPersonJsonLd } from "@/lib/jsonLd";

const title = "About";
const description = `${siteConfig.author} 소개 — 기술 스택, 수상 이력, 대회 참가, 프로젝트, 자격증`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    title,
    description,
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      <MotionProvider>
        <AboutPageContent />
      </MotionProvider>
    </>
  );
}
