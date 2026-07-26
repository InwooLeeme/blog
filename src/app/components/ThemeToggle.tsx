"use client"
import * as React from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useT } from "./LocaleProvider"

const RIPPLE_DURATION_MS = 450

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
}

/**
 * 클릭 지점(origin)에서 원형으로 퍼지는 View Transition으로 상태 변경을 적용한다.
 * View Transitions 미지원 또는 모션 최소화 설정이면 애니메이션 없이 즉시 적용.
 */
function circularReveal(origin: { x: number; y: number }, apply: () => void) {
  const doc = document as DocumentWithViewTransition
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches

  if (!doc.startViewTransition || prefersReducedMotion) {
    apply()
    return
  }

  const { x, y } = origin
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  // flushSync로 테마 클래스 변경을 동기 적용해야 스냅샷에 반영됨
  doc.startViewTransition(() => flushSync(apply)).ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: RIPPLE_DURATION_MS,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  })
}

export default function ModeToggle() {
  const t = useT()
  const { resolvedTheme, setTheme } = useTheme()

  const toggle = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const next = resolvedTheme === "dark" ? "light" : "dark"
      circularReveal({ x: e.clientX, y: e.clientY }, () => setTheme(next))
    },
    [resolvedTheme, setTheme],
  )

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("header.theme")}
      onClick={toggle}
      className="relative before:absolute before:-inset-1 before:content-['']"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
