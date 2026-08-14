import db from "@/lib/db";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").get<{ value: string }>(key);
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export async function getJSONSetting<T>(key: string, fallback: T): Promise<T> {
  const raw = await getSetting(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
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
  services: { title: string; desc: string; icon: string; image: string }[];
  testimonials: { name: string; city: string; text: string; rating: number }[];
  stats: { years: string; moves: string; cities: string; rating: string };
  trustBadges: { icon: string; title: string; desc: string }[];
  faq: { question: string; answer: string }[];
  locationCucutaImage: string;
  locationMedellinImage: string;
};

export async function getSiteContent(): Promise<SiteContent> {
  const [
    phone_display,
    whatsapp,
    email,
    address_cucuta,
    address_medellin,
    logo,
    heroTitle,
    heroSubtitle,
    heroImage,
    gallery,
    services,
    testimonials,
    stats,
    trustBadges,
    faq,
    locationCucutaImage,
    locationMedellinImage,
  ] = await Promise.all([
    getSetting("site.phone_display", "313 847 0094"),
    getSetting("site.whatsapp", "573138470094"),
    getSetting("site.email", "mudalogic.adm@gmail.com"),
    getSetting("site.address_cucuta", ""),
    getSetting("site.address_medellin", ""),
    getSetting("site.logo", ""),
    getSetting("hero.title", ""),
    getSetting("hero.subtitle", ""),
    getSetting("hero.image", ""),
    getJSONSetting("gallery.images", [] as SiteContent["gallery"]),
    getJSONSetting("services", [] as SiteContent["services"]),
    getJSONSetting("testimonials", [] as SiteContent["testimonials"]),
    getJSONSetting("stats", { years: "10", moves: "3500", cities: "32", rating: "4.9" }),
    getJSONSetting("trust_badges", [] as SiteContent["trustBadges"]),
    getJSONSetting("faq", [] as SiteContent["faq"]),
    getSetting("location.cucuta_image", ""),
    getSetting("location.medellin_image", ""),
  ]);

  return {
    phone_display,
    whatsapp,
    email,
    address_cucuta,
    address_medellin,
    logo,
    heroTitle,
    heroSubtitle,
    heroImage,
    gallery,
    services,
    testimonials,
    stats,
    trustBadges,
    faq,
    locationCucutaImage,
    locationMedellinImage,
  };
}
