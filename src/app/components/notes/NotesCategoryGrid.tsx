import Link from "next/link";
import { Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { countNotes, firstNoteSlug, noteHref, type NotesTreeNode } from "@/lib/notes";

/** Notes 인덱스 페이지의 카테고리 카드 그리드 — 트리 최상위 폴더를 카드로 보여주고,
 *  클릭하면 해당 카테고리의 첫 노트로 이동한다(폴더 자체는 별도 라우트가 없음). */
export default function NotesCategoryGrid({ tree }: { tree: NotesTreeNode[] }) {
  const categories = tree.filter(
    (node): node is Extract<NotesTreeNode, { type: "folder" }> => node.type === "folder",
  );

  if (categories.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categories.map((category) => {
        const target = firstNoteSlug(category.children);
        if (!target) return null;
        const href = noteHref(target);
        const count = countNotes(category.children);

        return (
          <Link key={category.path} href={href} className="group block">
            <Card className="h-full transition duration-200 hover:border-accent-brand hover:shadow-md hover:shadow-accent-brand/10">
              <CardContent className="flex items-center gap-3 p-4">
                <Folder className="h-5 w-5 shrink-0 text-accent-brand" />
                <span className="flex-1 truncate font-semibold transition-colors group-hover:text-accent-brand">
                  {category.name}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
