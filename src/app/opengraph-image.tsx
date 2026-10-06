import { ImageResponse } from "next/og";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const revalidate = 3600;

export const alt = "MudaLogic — Mudanzas sin estrés, solo sonrisas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await getSetting("site.logo", "");

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
          background: "linear-gradient(135deg, #0A1128 0%, #0A1128 55%, #0A3BA8 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(17,87,224,0.55) 0%, rgba(17,87,224,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(17,87,224,0.35) 0%, rgba(17,87,224,0) 70%)",
            display: "flex",
          }}
        />

        {logo ? (
          <img src={logo} alt="" width={160} height={160} style={{ objectFit: "contain", marginBottom: 28 }} />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0A3BA8 0%, #1157E0 60%, #5B95FF 100%)",
              display: "flex",
              marginBottom: 28,
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#FFFFFF",
          }}
        >
          MUDA<span style={{ color: "#5B95FF" }}>LOGIC</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#C7D4F5",
            marginTop: 14,
          }}
        >
          Mudanzas sin estrés, solo sonrisas
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#7FA0E0",
            marginTop: 26,
            letterSpacing: 1,
          }}
        >
          CÚCUTA · MEDELLÍN · TODA COLOMBIA
        </div>
      </div>
    ),
    { ...size }
  );
}
