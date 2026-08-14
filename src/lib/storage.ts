import path from "path";
import fs from "fs";

// Local-disk fallback used only when Vercel Blob isn't configured (e.g. local
// dev). On Vercel itself this directory is read-only/ephemeral, so uploads
// there always go through Blob storage instead — see saveUploadedFile below.
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  ensureDir(UPLOAD_DIR);
  fs.writeFileSync(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);
  return `/api/files/${filename}`;
}
