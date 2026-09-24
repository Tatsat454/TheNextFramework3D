import { ImageResponse } from "next/og";
import { profile } from "@/content/landmarks";

export const alt = `${profile.name} · Pocket Island`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const tiles = [
    { x: 700, y: 330, w: 380, h: 190, c: "#7EDC7A" },
    { x: 760, y: 250, w: 250, h: 110, c: "#6BC96C" },
    { x: 830, y: 190, w: 130, h: 70, c: "#4EAE5C" },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(180deg, #E4B4D8 0%, #F6C8BE 50%, #FFE6D0 100%)",
          padding: 72,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {tiles.map((t, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.h,
              background: t.c,
              borderRadius: 28,
              borderBottom: "36px solid #D9C2A5",
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 870, top: 120, width: 60, height: 60, background: "#7B6CF6", borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 800, top: 270, width: 70, height: 50, background: "#FF8A65", borderRadius: 10 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 620 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, color: "#4B3FB5", textTransform: "uppercase" }}>Pocket Island</div>
          <div style={{ fontSize: 86, lineHeight: 1, color: "#1E1B3A", marginTop: 18, letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 30, color: "#4A4668", marginTop: 24, lineHeight: 1.35 }}>{profile.headline}</div>
        </div>
      </div>
    ),
    size,
  );
}
