import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { GAME_MODE_LABELS, isGameMode } from "@/lib/types";

export const runtime = "edge";

async function loadBebasFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9W0.woff"
  );
  return res.arrayBuffer();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = searchParams.get("score") ?? "0";
  const modeParam = searchParams.get("mode") ?? "train";
  const name = searchParams.get("name") ?? "Player";
  const mode = isGameMode(modeParam) ? modeParam : "train";

  const fontData = await loadBebasFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          color: "#fff",
          fontFamily: "Bebas Neue",
        }}
      >
        <div
          style={{
            fontSize: 32,
            letterSpacing: 4,
            color: "#ff2d55",
            marginBottom: 16,
          }}
        >
          THE BRAIN ROT GAME
        </div>
        <div
          style={{
            fontSize: 120,
            color: "#00f5d4",
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#6e6e7a",
            marginTop: 8,
          }}
        >
          FOCUS SCORE
        </div>
        <div
          style={{
            marginTop: 24,
            padding: "8px 24px",
            backgroundColor: "#1a1a26",
            borderRadius: 8,
            fontSize: 24,
            color: "#bf5af2",
          }}
        >
          {GAME_MODE_LABELS[mode]}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#fff",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "#ffd60a",
          }}
        >
          Can you beat me?
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Bebas Neue",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
