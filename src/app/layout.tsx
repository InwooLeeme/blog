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
import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { siteConfig } from "@/lib/site";

// 본문 폰트 — 한글/라틴을 함께 다루는 Pretendard (public/fonts, Medium·Bold만 자체 호스팅)
const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
            <BackgroundDecor />
            <div className="flex flex-col min-h-screen">
              <Header title={siteConfig.name} />
              <main className="flex-1">
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
