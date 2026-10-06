import { ImageResponse } from "next/og";
import { getSetting } from "@/lib/settings";

export async function renderAppIcon(size: number) {
  const logo = await getSetting("site.logo", "");
  const inner = Math.round(size * 0.64);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A3BA8 0%, #1157E0 55%, #5B95FF 100%)",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) requires a raw <img>, not next/image
          <img src={logo} alt="" width={inner} height={inner} style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ display: "flex", color: "#FFFFFF", fontSize: Math.round(size * 0.5), fontWeight: 800 }}>M</div>
        )}
      </div>
    ),
    { width: size, height: size }
  );
}
