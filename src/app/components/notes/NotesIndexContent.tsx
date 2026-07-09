"use client";

import { useLocale } from "../LocaleProvider";

/** Notes 인덱스 본문 — 안내문이 문장 단위 JSX라 언어별 블록을 통째로 전환 */
export default function NotesIndexContent() {
  const { locale } = useLocale();

  if (locale === "en") {
    return (
      <>
        <p>
          A collection of algorithm implementations I use often. Pick an item from the tree on the left.
        </p>
        <h2>Writing rules</h2>
        <ul>
          <li>Add files as <code>content/notes/&lt;category&gt;/&lt;topic&gt;.mdx</code>.</li>
          <li>The frontmatter <code>title</code> is shown in the sidebar; without it, the file name is used.</li>
          <li>Files and folders starting with <code>_</code> or <code>.</code> are hidden from the tree.</li>
        </ul>
      </>
    );
  }

  return (
    <>
      <p>
        자주 쓰는 알고리즘 구현 코드를 모아둔 공간입니다. 왼쪽 트리에서 항목을 선택하세요.
      </p>
      <h2>작성 규칙</h2>
      <ul>
        <li><code>content/notes/&lt;카테고리&gt;/&lt;주제&gt;.mdx</code> 형식으로 파일을 추가합니다.</li>
        <li>frontmatter의 <code>title</code>이 사이드바에 표시됩니다. 없으면 파일 이름이 표시됩니다.</li>
        <li><code>_</code> 또는 <code>.</code>으로 시작하는 파일/폴더는 트리에서 숨겨집니다.</li>
      </ul>
    </>
  );
}
