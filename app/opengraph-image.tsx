export const dynamic = "force-static";

import { ImageResponse } from "next/og";

export const alt =
  "JDesk — desktop apps with a Java core and a web UI. The Tauri model, without Rust.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EMBER = "#ff8a3d";
const ARC = "#35d6c6";
const BG = "#0b0d12";
const FG = "#e9ecf3";
const MUTED = "#9aa4b6";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          backgroundImage: `radial-gradient(900px 500px at 8% -10%, rgba(255,138,61,0.16), transparent), radial-gradient(900px 520px at 100% 110%, rgba(53,214,198,0.18), transparent)`,
          padding: "72px 76px",
          color: FG,
          fontFamily: "sans-serif",
        }}
      >
        {/* top: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 9,
              border: `2px solid #313a4c`,
              display: "flex",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            JDesk
          </div>
        </div>

        {/* middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -2.5,
            }}
          >
            <span>Desktop apps with a&nbsp;</span>
            <span style={{ color: EMBER }}>Java core</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -2.5,
            }}
          >
            <span>and a&nbsp;</span>
            <span style={{ color: ARC }}>web UI</span>
            <span>.</span>
          </div>

          {/* bridge motif */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 34 }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: EMBER,
                display: "flex",
              }}
            />
            <div
              style={{
                width: 380,
                height: 3,
                background: `linear-gradient(90deg, ${EMBER}, ${ARC})`,
                display: "flex",
              }}
            />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: ARC,
                display: "flex",
              }}
            />
          </div>
        </div>

        {/* bottom: tagline */}
        <div style={{ display: "flex", fontSize: 25, color: MUTED }}>
          Java 25 core · System WebView · No Rust · No bundled Chromium
        </div>
      </div>
    ),
    { ...size },
  );
}