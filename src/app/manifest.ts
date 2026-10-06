import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MudaLogic | Mudanzas y Trasteos Nacionales",
    short_name: "MudaLogic",
    description: "Mudanzas y trasteos nacionales — Cúcuta, Medellín, toda Colombia.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1128",
    theme_color: "#0A1128",
    icons: [
      { src: "/api/app-icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/api/app-icon?size=512", sizes: "512x512", type: "image/png" },
      { src: "/api/app-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
