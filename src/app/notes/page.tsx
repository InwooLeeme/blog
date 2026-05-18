import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "자주 쓰는 알고리즘 구현 코드 모음",
};

export default function NotesIndexPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert prose-main">
      <h1>Notes</h1>
      <p>
        자주 쓰는 알고리즘 구현 코드를 모아둔 공간입니다. 왼쪽 트리에서 항목을 선택하세요.
      </p>
      <h2>작성 규칙</h2>
      <ul>
        <li><code>content/notes/&lt;카테고리&gt;/&lt;주제&gt;.mdx</code> 형식으로 파일을 추가합니다.</li>
        <li>frontmatter의 <code>title</code>이 사이드바에 표시됩니다. 없으면 파일 이름이 표시됩니다.</li>
        <li><code>_</code> 또는 <code>.</code>으로 시작하는 파일/폴더는 트리에서 숨겨집니다.</li>
      </ul>
    </article>
  );
}
