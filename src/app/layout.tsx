import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import { ThemeProvider } from "./components/ThemeProvider";
import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"

const BlogInfo = {
  title: "InwooLeeme.dev",
  description: "알고리즘과 개발 이야기",
};

const SITE_URL =
  process.env.SITE_URL || "https://inwooleeme.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BlogInfo.title,
    template: `%s · ${BlogInfo.title}`,
  },
  description: BlogInfo.description,
  openGraph: {
    type: "website",
    siteName: BlogInfo.title,
    title: BlogInfo.title,
    description: BlogInfo.description,
    url: SITE_URL,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: BlogInfo.title,
    description: BlogInfo.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header title={BlogInfo.title} />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Analytics />
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
