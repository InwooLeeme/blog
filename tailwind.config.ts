// tailwind.config.ts
import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"
import animate from "tailwindcss-animate"         // shadcn/ui 권장
// 선택: 요약 2줄 자르기 쓸 때만 주석 해제
// import lineClamp from "@tailwindcss/line-clamp"

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
      // 필요하면 색/폰트/애니메이션 토큰 확장
      borderRadius: { "2xl": "1rem" },
    },
  },

  plugins: [
    typography,        // prose
    animate,           // shadcn/ui 애니메이션
    // lineClamp,      // 라인 클램프 쓰면 주석 해제
  ],
}

export default config
