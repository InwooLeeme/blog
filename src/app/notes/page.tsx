import type { Metadata } from "next";
import { countNotes, getNotesTree } from "@/lib/notes";
import NotesIndexContent from "../components/notes/NotesIndexContent";
import NotesCategoryGrid from "../components/notes/NotesCategoryGrid";

export const metadata: Metadata = {
  title: "Notes",
  description: "자주 쓰는 알고리즘 구현 코드 모음",
  alternates: { canonical: "/notes" },
};

export default function NotesIndexPage() {
  const tree = getNotesTree();
  const categoryCount = tree.filter((node) => node.type === "folder").length;
  const noteCount = countNotes(tree);

  return (
    <div>
      <article className="prose prose-zinc dark:prose-invert prose-main">
        <h1>Notes</h1>
        <NotesIndexContent categoryCount={categoryCount} noteCount={noteCount} />
      </article>
      <NotesCategoryGrid tree={tree} />
    </div>
  );
}
