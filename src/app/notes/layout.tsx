import { getNotesTree } from "@/lib/notes";
import NotesTreeSidebar from "@/app/components/notes/NotesTreeSidebar";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  const tree = getNotesTree();
  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <div className="lg:flex lg:gap-8">
        <NotesTreeSidebar tree={tree} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
