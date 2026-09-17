import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
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
      <html
        lang="ko"
        suppressHydrationWarning
        className={`${geistMono.variable} ${spaceGrotesk.variable}`}
      >
        <body className="antialiased w-full">
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
