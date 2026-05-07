// tailwind.config.ts
import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

const config: Config = {
  darkMode: "class",

  // MDX(App Router), 컴포넌트, 컨텐츠 폴더 모두 스캔
  content: [
    "./app/**/*.{ts,tsx,md,mdx}",
    "./components/**/*.{ts,tsx,md,mdx}",
    "./content/**/*.{md,mdx}",
    "./mdx-components.{ts,tsx}",       // @next/mdx 매핑 파일
  ],

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem" },
    },
    extend: {
      borderRadius: { "2xl": "1rem" },
    },
  },

  plugins: [
    typography,        // prose
  ],
}

export default config
