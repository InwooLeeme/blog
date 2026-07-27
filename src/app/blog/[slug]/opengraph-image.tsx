import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPostBySlug, getPublishedSlugs } from "@/lib/posts";
import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, loadOgFonts } from "@/lib/og";

export const alt = "Blog post";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface ImageProps {
  params: Promise<{ slug: string }>;
}

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

/** 로컬 public 경로의 cover 파일을 그대로 OG 이미지로 반환. 실패 시 null */
async function coverResponse(cover: string): Promise<Response | null> {
  if (!cover.startsWith("/")) return null; // 원격 cover는 동적 생성으로 폴백
  try {
    const data = await readFile(join(process.cwd(), "public", cover));
    const ext = cover.split(".").pop()?.toLowerCase() ?? "";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}

type Post = NonNullable<ReturnType<typeof getPostBySlug>>;

/** 제목·날짜·태그로 OG 이미지를 동적 생성 */
async function generatedOgImage(post: Post) {
  const fonts = await loadOgFonts();

  const title = post.meta.title;
  const date = post.meta.date;
  const tags = (post.meta.tags ?? []).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          padding: 80,
          fontFamily: "Pretendard",
          color: "#fafafa",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -220,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #fff383 0%, transparent 70%)",
            opacity: 0.32,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 500,
            color: "#a1a1aa",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff383",
              display: "flex",
            }}
          />
          InwooLeeme.dev
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -2,
            display: "flex",
            maxWidth: "100%",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 26,
            fontWeight: 500,
            color: "#a1a1aa",
          }}
        >
          <span style={{ display: "flex" }}>{date}</span>
          {tags.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ opacity: 0.4, display: "flex" }}>·</span>
              <div style={{ display: "flex", gap: 10 }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(255, 243, 131, 0.15)",
                      color: "#fff383",
                      padding: "6px 18px",
                      borderRadius: 999,
                      fontSize: 22,
                      fontWeight: 500,
                      display: "flex",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  // cover가 있으면 cover를, 없거나 실패하면 동적 생성 이미지를 사용
  if (post.meta.cover) {
    const fromCover = await coverResponse(post.meta.cover);
    if (fromCover) return fromCover;
  }
  return generatedOgImage(post);
}
