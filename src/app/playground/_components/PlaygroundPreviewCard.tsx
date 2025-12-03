import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PreviewCardParams = {
    id: string;          // map 렌더링 key 용
    href: string;        // 외부 링크 
    imageSrc?: string;   // 상단 썸네일 
    imageAlt?:string;
    title: string;       // 하단 제목
    description?: string; // 하단 설명
};

type Props = PreviewCardParams;

export function PlaygroundPreviewCard({
  href,
  imageSrc,
  imageAlt = "",
  title,
  description,
}: Props) {
  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-zinc-800/60 bg-zinc-950/80 text-zinc-100 shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        aria-label={title}
      >
        <div className="relative aspect-[16/7] w-full overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt} 
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/60 via-fuchsia-500/35 to-sky-500/60 transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
          )}

          {/* readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
        </div>

        <CardContent className="space-y-1.5 p-4">
          <div className="text-base font-semibold leading-snug text-zinc-100">
            {title}
          </div>
          {description ? (
            <p className="text-sm leading-snug text-zinc-400 line-clamp-2">
              {description}
            </p>
          ) : null}
        </CardContent>
      </a>
    </Card>
  );
}
