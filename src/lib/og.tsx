import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

const loadFont = cache((weight: 700 | 500) => {
  const filename = `Pretendard-${weight === 700 ? "Bold" : "Medium"}.otf`;
  return readFile(join(process.cwd(), "src", "assets", "fonts", filename));
});

export async function loadOgFonts() {
  const [bold, medium] = await Promise.all([loadFont(700), loadFont(500)]);
  return [
    { name: "Pretendard", data: bold, style: "normal" as const, weight: 700 as const },
    { name: "Pretendard", data: medium, style: "normal" as const, weight: 500 as const },
  ];
}

/** 루트/About OG 이미지가 공유하는 배경 블롭 두 개 */
export function OgBlobBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff383 0%, transparent 70%)",
          opacity: 0.35,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -250,
          left: -250,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff383 0%, transparent 70%)",
          opacity: 0.18,
          display: "flex",
        }}
      />
    </div>
  );
}
