import { ExternalLink, Tag as TagIcon } from "lucide-react";

type Platform = "BOJ" | "AtCoder" | "Codeforces" | "LeetCode" | "Programmers";

const PLATFORM_STYLES: Record<string, { bg: string; label: string }> = {
  BOJ: { bg: "bg-[#0076c0]", label: "BOJ" },
  AtCoder: { bg: "bg-zinc-700", label: "AtCoder" },
  Codeforces: { bg: "bg-[#1e6dd3]", label: "Codeforces" },
  LeetCode: { bg: "bg-[#ffa116]", label: "LeetCode" },
  Programmers: { bg: "bg-[#3e4ee3]", label: "Programmers" },
};

interface ProblemMetaProps {
  platform: Platform | string;
  id?: string | number;
  title?: string;
  tags?: string;
  link: string;
}


function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-");
}

export function ProblemMeta({ platform, id, title, tags, link }: ProblemMetaProps) {
  const tagList = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const style = PLATFORM_STYLES[platform] ?? { bg: "bg-zinc-600", label: platform };

  return (
    <div className="not-prose my-6 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${style.bg} rounded px-2 py-1 text-xs font-bold uppercase tracking-wider text-white`}
        >
          {style.label}
        </span>
        {id != null ? (
          <span className="font-mono text-sm text-muted-foreground">#{id}</span>
        ) : null}
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent-brand hover:underline"
        >
          문제 보기 <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {title ? (
        <h3
          id={slugify(title)}
          className="mt-2 text-lg font-semibold leading-snug text-foreground"
        >
          {title}
        </h3>
      ) : null}

      {tagList.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {tagList.map((t) => (
            <span
              key={t}
              className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
