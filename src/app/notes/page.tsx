import type { Metadata } from "next";
import NotesIndexContent from "../components/notes/NotesIndexContent";

export const metadata: Metadata = {
  title: "Notes",
  description: "자주 쓰는 알고리즘 구현 코드 모음",
  alternates: { canonical: "/notes" },
};

export default function NotesIndexPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert prose-main">
      <h1>Notes</h1>
      <NotesIndexContent />
    </article>
  );
}
