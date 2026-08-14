import db from "@/lib/db";

export function getSetting(key: string, fallback = ""): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

export function getJSONSetting<T>(key: string, fallback: T): T {
  const raw = getSetting(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export type SiteContent = {
  phone_display: string;
  whatsapp: string;
  email: string;
  address_cucuta: string;
  address_medellin: string;
  logo: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  gallery: { src: string; caption: string }[];
  services: { title: string; desc: string; icon: string }[];
  testimonials: { name: string; city: string; text: string; rating: number }[];
  stats: { years: string; moves: string; cities: string; rating: string };
};

export function getSiteContent(): SiteContent {
  return {
    phone_display: getSetting("site.phone_display", "313 847 0094"),
    whatsapp: getSetting("site.whatsapp", "573138470094"),
    email: getSetting("site.email", "mudalogic.adm@gmail.com"),
    address_cucuta: getSetting("site.address_cucuta", ""),
    address_medellin: getSetting("site.address_medellin", ""),
    logo: getSetting("site.logo", ""),
    heroTitle: getSetting("hero.title", ""),
    heroSubtitle: getSetting("hero.subtitle", ""),
    heroImage: getSetting("hero.image", ""),
    gallery: getJSONSetting("gallery.images", []),
    services: getJSONSetting("services", []),
    testimonials: getJSONSetting("testimonials", []),
    stats: getJSONSetting("stats", { years: "10", moves: "3500", cities: "32", rating: "4.9" }),
  };
}
