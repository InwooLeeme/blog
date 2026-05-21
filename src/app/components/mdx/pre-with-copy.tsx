"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

type PreProps = React.HTMLAttributes<HTMLPreElement> & {
  children?: React.ReactNode
  "data-language"?: string
}

export default function PreWithCopy({ className = "", children, ...props }: PreProps) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const [copied, setCopied] = React.useState(false)
  const language = props["data-language"]

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
      {language ? (
        <span
          className="absolute right-20 top-2 z-10 select-none rounded-md border bg-background/80 dark:bg-zinc-900/70 px-2 py-0.5 text-[0.65rem] font-mono font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur supports-[backdrop-filter]:backdrop-blur"
          aria-hidden
        >
          {language}
        </span>
      ) : null}

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
