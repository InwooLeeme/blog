"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  ListTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotesTreeNode } from "@/lib/notes";
import { useT } from "../LocaleProvider";

interface Props {
  tree: NotesTreeNode[];
}

function nodeKey(node: NotesTreeNode): string {
  return node.type === "folder" ? `f:${node.path}` : `n:${node.slug.join("/")}`;
}

function countFiles(nodes: NotesTreeNode[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "file") n++;
    else n += countFiles(node.children);
  }
  return n;
}

export default function NotesTreeSidebar({ tree }: Props) {
  const t = useT();
  const pathname = usePathname();

  const activeSlug = React.useMemo<string[] | null>(() => {
    const prefix = "/notes/";
    if (!pathname || !pathname.startsWith(prefix)) return null;
    return pathname
      .slice(prefix.length)
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
  }, [pathname]);

  const totalCount = React.useMemo(() => countFiles(tree), [tree]);

  const header = (
    <div className="mb-3 flex items-center justify-between gap-2 border-b pb-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ListTree className="h-4 w-4 text-accent-brand" />
        <span>Notes</span>
      </div>
      <span className="rounded-full bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand dark:text-accent-brand tabular-nums">
        {totalCount}
      </span>
    </div>
  );

  const body =
    tree.length === 0 ? (
      <div className="flex flex-col items-center gap-2 px-2 py-12 text-center text-xs text-muted-foreground">
        <FileCode2 className="h-7 w-7 opacity-30" />
        <p>{t("notes.empty")}</p>
        <p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            content/notes/
          </code>
          {t("notes.addHint")}
        </p>
      </div>
    ) : (
      <ul className="flex flex-col gap-0.5">
        {tree.map((node) => (
          <TreeRow key={nodeKey(node)} node={node} activeSlug={activeSlug} />
        ))}
      </ul>
    );

  return (
    <>
      {/* 모바일: 접을 수 있는 상단 트리 */}
      <details className="lg:hidden mb-4 group">
        <summary className="cursor-pointer list-none rounded-lg border bg-card px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition hover:bg-muted/50">
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          <ListTree className="h-4 w-4 text-accent-brand" />
          <span>{t("notes.toc")}</span>
          <span className="ml-auto rounded-full bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand dark:text-accent-brand tabular-nums">
            {totalCount}
          </span>
        </summary>
        <Card className="mt-2">
          <CardContent className="p-3">
            {header}
            <ScrollArea className="max-h-[60vh] pr-1">{body}</ScrollArea>
          </CardContent>
        </Card>
      </details>

      {/* 데스크톱: sticky 사이드바 */}
      <aside className="sticky top-24 hidden lg:block w-72 shrink-0 self-start">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            {header}
            <ScrollArea className="max-h-[calc(100vh-12rem)] pr-1">
              {body}
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
    </>
  );
}

function TreeRow({
  node,
  activeSlug,
}: {
  node: NotesTreeNode;
  activeSlug: string[] | null;
}) {
  if (node.type === "folder")
    return <FolderRow node={node} activeSlug={activeSlug} />;
  return <FileRow node={node} activeSlug={activeSlug} />;
}

function FolderRow({
  node,
  activeSlug,
}: {
  node: Extract<NotesTreeNode, { type: "folder" }>;
  activeSlug: string[] | null;
}) {
  const containsActive = React.useMemo(() => {
    if (!activeSlug) return false;
    const folderPath = node.path;
    const activePath = activeSlug.join("/");
    return activePath === folderPath || activePath.startsWith(folderPath + "/");
  }, [activeSlug, node.path]);

  const [open, setOpen] = React.useState(containsActive);

  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const childCount = React.useMemo(
    () => countFiles(node.children),
    [node.children],
  );

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-1.5 rounded-md py-1.5 pl-2 pr-2 text-left transition hover:bg-muted/70"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
        />
        {open ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-accent-brand" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-accent-brand" />
        )}
        <span className="truncate text-sm font-medium">{node.name}</span>
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground tabular-nums group-hover:bg-background">
          {childCount}
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="ml-[15px] mt-0.5 flex flex-col gap-0.5 border-l border-border/60 pl-2">
            {node.children.map((child) => (
              <TreeRow
                key={nodeKey(child)}
                node={child}
                activeSlug={activeSlug}
              />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function FileRow({
  node,
  activeSlug,
}: {
  node: Extract<NotesTreeNode, { type: "file" }>;
  activeSlug: string[] | null;
}) {
  const isActive = activeSlug?.join("/") === node.slug.join("/");
  const href = `/notes/${node.slug.map(encodeURIComponent).join("/")}`;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-1.5 rounded-md py-1.5 pl-7 pr-2 text-sm transition",
          isActive
            ? "bg-accent-brand/10 text-accent-brand dark:text-accent-brand font-medium"
            : "text-foreground/80 hover:bg-muted/70 hover:text-foreground",
        )}
      >
        {isActive ? (
          <span
            className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent-brand"
            aria-hidden
          />
        ) : null}
        <FileCode2
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isActive ? "text-accent-brand" : "text-muted-foreground",
          )}
        />
        <span className="truncate">{node.name}</span>
      </Link>
    </li>
  );
}
