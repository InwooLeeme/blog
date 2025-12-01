"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

type PreProps = React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }

export default function PreWithCopy({ className = "", children, ...props }: PreProps) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const [copied, setCopied] = React.useState(false)

  async function onCopy() {
    const text =
      preRef.current?.querySelector("code")?.textContent ??
      preRef.current?.textContent ??
      ""
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative group">
      {/* 버튼을 pre 바깥에 올려 z-index 충돌을 피함 */}
      <Button
        type="button"
        onClick={onCopy}
        variant="outline"
        size="sm"
        className="absolute right-2 top-2 h-8 gap-1 z-10
                   opacity-0 group-hover:opacity-100 focus:opacity-100 active:opacity-100 transition
                   bg-background/80 dark:bg-zinc-900/70 border shadow-sm
                   backdrop-blur supports-[backdrop-filter]:backdrop-blur
                   text-xs"
        aria-label={copied ? "Copied" : "Copy code to clipboard"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </Button>

      <pre
        ref={preRef}
        className={`rounded-lg border overflow-x-auto ${className}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
