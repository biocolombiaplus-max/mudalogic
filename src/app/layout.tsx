import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mudalogic.com"),
  title: "MudaLogic | Mudanzas y Trasteos Nacionales en Colombia",
  description:
    "MudaLogic: mudanzas y trasteos nacionales desde Cúcuta y Medellín hacia toda Colombia. Empacamos y desempacamos desde cero, los mejores precios, contrato digital y rastreo en tiempo real. Cotiza gratis por WhatsApp.",
  keywords: [
    "mudanzas Colombia",
    "trasteos Cúcuta",
    "mudanzas Medellín",
    "empresa de mudanzas nacionales",
    "trasteos nacionales",
    "MudaLogic",
  ],
  openGraph: {
    title: "MudaLogic | Mudanzas sin estrés, solo sonrisas",
    description:
      "Especialistas en mudanzas nacionales. Empacamos, transportamos y desempacamos por ti. Cotiza gratis y rastrea tu mudanza en tiempo real.",
    siteName: "MudaLogic",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MudaLogic | Mudanzas sin estrés, solo sonrisas",
    description:
      "Especialistas en mudanzas nacionales. Empacamos, transportamos y desempacamos por ti. Cotiza gratis y rastrea tu mudanza en tiempo real.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MudaLogic",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1128",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
