import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/settings";
import { saveUploadedFile } from "@/lib/storage";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const SCALAR_IMAGE_KEYS = ["site.logo", "hero.image", "location.cucuta_image", "location.medellin_image"];

type MigrationResult = { key: string; oldUrl: string; newUrl?: string; error?: string };

async function migrateUrl(url: string): Promise<{ newUrl: string } | { error: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const ext = EXT_BY_TYPE[contentType] || ".jpg";
    const buffer = Buffer.from(await res.arrayBuffer());
    const newUrl = await saveUploadedFile(buffer, `${uuidv4()}${ext}`, contentType);
    return { newUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

function alreadyMigrated(url: string): boolean {
  const r2Base = process.env.R2_PUBLIC_URL;
  return Boolean(r2Base && url.startsWith(r2Base));
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const settings = await getAllSettings();
  const results: MigrationResult[] = [];
  const updates: Record<string, string> = {};

  for (const key of SCALAR_IMAGE_KEYS) {
    const url = settings[key];
    if (!url || !/^https?:\/\//.test(url) || alreadyMigrated(url)) continue;
    const outcome = await migrateUrl(url);
    if ("newUrl" in outcome) {
      updates[key] = outcome.newUrl;
      results.push({ key, oldUrl: url, newUrl: outcome.newUrl });
    } else {
      results.push({ key, oldUrl: url, error: outcome.error });
    }
  }

  let services: { image?: string; [k: string]: unknown }[] = [];
  try {
    services = settings.services ? JSON.parse(settings.services) : [];
  } catch {
    services = [];
  }
  let servicesChanged = false;
  for (const s of services) {
    if (!s.image || !/^https?:\/\//.test(s.image) || alreadyMigrated(s.image)) continue;
    const outcome = await migrateUrl(s.image);
    if ("newUrl" in outcome) {
      results.push({ key: `services:${s.title ?? ""}`, oldUrl: s.image, newUrl: outcome.newUrl });
      s.image = outcome.newUrl;
      servicesChanged = true;
    } else {
      results.push({ key: `services:${s.title ?? ""}`, oldUrl: s.image, error: outcome.error });
    }
  }
  if (servicesChanged) updates.services = JSON.stringify(services);

  let gallery: { src?: string; caption?: string }[] = [];
  try {
    gallery = settings["gallery.images"] ? JSON.parse(settings["gallery.images"]) : [];
  } catch {
    gallery = [];
  }
  let galleryChanged = false;
  for (const g of gallery) {
    if (!g.src || !/^https?:\/\//.test(g.src) || alreadyMigrated(g.src)) continue;
    const outcome = await migrateUrl(g.src);
    if ("newUrl" in outcome) {
      results.push({ key: `gallery:${g.caption ?? ""}`, oldUrl: g.src, newUrl: outcome.newUrl });
      g.src = outcome.newUrl;
      galleryChanged = true;
    } else {
      results.push({ key: `gallery:${g.caption ?? ""}`, oldUrl: g.src, error: outcome.error });
    }
  }
  if (galleryChanged) updates["gallery.images"] = JSON.stringify(gallery);

  await Promise.all(Object.entries(updates).map(([key, value]) => setSetting(key, value)));

  const migrated = results.filter((r) => r.newUrl);
  const failed = results.filter((r) => r.error);
  return NextResponse.json({ migrated, failed, total: results.length });
}
