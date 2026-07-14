import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "InwooLeeme.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function loadFont(weight: 700 | 500) {
  const filename = `Pretendard-${weight === 700 ? "Bold" : "Medium"}.otf`;
  return readFile(join(process.cwd(), "src", "assets", "fonts", filename));
}

export default async function Image() {
  const [bold, medium] = await Promise.all([loadFont(700), loadFont(500)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #fff383 0%, transparent 70%)",
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
            background:
              "radial-gradient(circle, #fff383 0%, transparent 70%)",
            opacity: 0.18,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#fff383",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            InwooLeeme.dev
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            fontWeight: 500,
            color: "#a1a1aa",
          }}
        >
          알고리즘과 개발 이야기
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, style: "normal", weight: 700 },
        { name: "Pretendard", data: medium, style: "normal", weight: 500 },
      ],
    },
  );
}
