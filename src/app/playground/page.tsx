import { PlaygroundPreviewCard, type PreviewCardParams } from "./_components/PlaygroundPreviewCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/playground" },
};

// @params (PreviewCardParams)
// - id: string
//   리스트 렌더링에서 key로 쓰는 고유 식별자 (href 대신 권장)
//
// - href: string
//   카드 클릭 시 이동할 외부 링크 (새 탭으로 열림)
//
// - imageSrc?: string
//   상단 썸네일 이미지 경로 (없으면 그라데이션 fallback)
//
// - imageAlt?: string
//   썸네일 이미지 대체 텍스트
//
// - title: string
//   카드 하단의 제목 텍스트
//
// - description?: string
//   카드 하단의 설명 텍스트 (선택)
//
const playgroundList:PreviewCardParams[] = [
    {
        id: "InwooLeeme 개발 블로그",
        href : "https://inwooleeme.vercel.app/blog",
        imageSrc: "/assets/playground/BlogThumbnail.png",
        imageAlt: "InwooLeeme 개발 블로그",
        title: "InwooLeeme 개발 블로그",
        description: "My Personal Development Blog with Next.js and Vercel",
    },
]

export default function Playground(){
    return(
        <div className="mx-auto w-full max-w-6xl mt-6">
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {playgroundList.map((params) => (
                <PlaygroundPreviewCard key={params.id} {...params} />
              ))}
            </div>
        </div>
    )
}