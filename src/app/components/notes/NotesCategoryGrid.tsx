import { contentCardClass, contentCardInteractionClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, FileCode2, Folder } from "lucide-react";
import { countNotes, noteHref, type NotesTreeNode } from "@/lib/notes";

/** 카테고리를 펼쳐 노트 목록을 확인한 뒤 원하는 글로 이동한다. */
export default function NotesCategoryGrid({ tree }: { tree: NotesTreeNode[] }) {
  const categories = tree.filter(
    (node): node is Extract<NotesTreeNode, { type: "folder" }> => node.type === "folder",
  );
  const rootNotes = tree.filter((node) => node.type === "file");

  return (
    <div className="mt-8 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
      {categories.map((category) => {
        const count = countNotes(category.children);
        if (count === 0) return null;

        return (
          <details key={category.path} className={cn(contentCardClass, "group/category open:border-accent-brand/40")}>
            <summary className={cn(contentCardInteractionClass, "flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-xl p-5 [&::-webkit-details-marker]:hidden sm:p-6")}>
              <Folder className="h-5 w-5 shrink-0 text-accent-brand" aria-hidden />
              <span className="min-w-0 flex-1 break-words font-semibold">
                {category.name}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {count}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/category:rotate-90 motion-reduce:transition-none" aria-hidden />
            </summary>
            <div className="border-t px-3 py-2">
              <NoteLinks nodes={category.children} />
            </div>
          </details>
        );
      })}
      {rootNotes.length > 0 ? (
        <div className={cn(contentCardClass, "p-3 sm:col-span-2")}>
          <NoteLinks nodes={rootNotes} />
        </div>
      ) : null}
    </div>
  );
}

function NoteLinks({ nodes }: { nodes: NotesTreeNode[] }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.type === "folder" ? node.path : node.slug.join("/")}>
          {node.type === "folder" ? (
            countNotes(node.children) > 0 ? (
              <div className="py-2">
                <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">{node.name}</p>
                <div className="ml-3 border-l pl-2">
                  <NoteLinks nodes={node.children} />
                </div>
              </div>
            ) : null
          ) : (
            <Link
              href={noteHref(node.slug)}
              className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <FileCode2 className="h-4 w-4 shrink-0 text-accent-brand" aria-hidden />
              <span className="min-w-0 break-words">{node.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
