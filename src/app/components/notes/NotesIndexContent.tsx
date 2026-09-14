"use client";

import { useLocale } from "../LocaleProvider";

interface Props {
  categoryCount: number;
  noteCount: number;
}

/** Notes 인덱스 본문 — 안내문이 문장 단위 JSX라 언어별 블록을 통째로 전환 */
export default function NotesIndexContent({ categoryCount, noteCount }: Props) {
  const { locale } = useLocale();

  if (locale === "en") {
    return (
      <p>
        A collection of algorithm implementations I use often — {categoryCount} categories,{" "}
        {noteCount} notes. Expand a category to choose a note, or use the search at the top.
      </p>
    );
  }

  return (
    <p>
      자주 쓰는 알고리즘 구현 코드를 모아둔 공간입니다 — {categoryCount}개 카테고리, {noteCount}개
      노트. 카테고리를 펼쳐 노트를 선택하거나 상단 검색을 이용하세요.
    </p>
  );
}
