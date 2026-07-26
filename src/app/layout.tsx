import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ViewTransitionRejectionGuard from "./components/ViewTransitionRejectionGuard";
import PageTransition from "./components/PageTransition";
import { ThemeProvider } from "./components/ThemeProvider";
import { LocaleProvider } from "./components/LocaleProvider";
import BackgroundDecor from "./components/BackgroundDecor";
import Tr from "./components/Tr";
import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { siteConfig } from "@/lib/site";

// 본문 폰트 — 한글/라틴을 함께 다루는 Pretendard (public/fonts, Medium·Bold만 자체 호스팅)
// 서브셋되지 않은 전체 완성형 한글 글리프 포함으로 두 파일 합쳐 약 1.6MB에 달해,
// preload로 걸어두면 저속 회선에서 다른 리소스(LCP 이미지 등)와 대역폭을 다툰다.
// display: swap이라 preload 없이도 폴백 폰트로 즉시 텍스트가 보이고 이후 교체되므로 안전하다.
const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
  preload: false,
});

// 코드블록 등 일부 UI에서만 쓰이므로 모든 페이지의 초기 로드에서 preload하지 않는다
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// 제목용 디스플레이 폰트
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"], 
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${pretendard.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased w-full`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-brand"
            >
              <Tr id="header.skipToContent" />
            </a>
            <BackgroundDecor />
            <div className="flex flex-col min-h-screen">
              <Header title={siteConfig.name} />
              <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                <PageTransition>{children}</PageTransition>
              </main>
              <Analytics />
              <Footer />
            </div>
            <ScrollToTop />
            <ViewTransitionRejectionGuard />
            </LocaleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
