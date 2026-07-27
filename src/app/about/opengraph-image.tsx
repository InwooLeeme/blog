import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, loadOgFonts, OgBlobBackground } from "@/lib/og";

export const alt = "About";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();

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
        <OgBlobBackground />

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
            {siteConfig.author}
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
          문제를 풀고, 만들고, 기록합니다.
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
