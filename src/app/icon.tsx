import { ImageResponse } from "next/og";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const revalidate = 3600;

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await getSetting("site.logo", "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A3BA8 0%, #1157E0 60%, #5B95FF 100%)",
          borderRadius: "50%",
        }}
      >
        {logo ? (
          <img src={logo} alt="" width={44} height={44} style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", color: "#FFFFFF", fontSize: 32, fontWeight: 800 }}>M</div>
        )}
      </div>
    ),
    { ...size }
  );
}
