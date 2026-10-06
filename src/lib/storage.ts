import path from "path";
import fs from "fs";

// Local-disk fallback used only when neither R2 nor Vercel Blob is
// configured (e.g. local dev). On Vercel itself this directory is
// read-only/ephemeral, so uploads there always go through R2 or Blob
// instead — see saveUploadedFile below.
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

async function saveToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  );
  const base = process.env.R2_PUBLIC_URL!.replace(/\/+$/, "");
  return `${base}/${filename}`;
}

// Storage backend priority: Cloudflare R2 (if configured) > Vercel Blob (if
// configured) > local disk (dev only). R2 is tried first because it has a
// much larger free tier and no egress fees, so once configured it's the
// preferred production backend; Blob stays as a fallback for projects that
// already rely on it. If the primary configured backend fails at runtime
// (e.g. a plan/quota limit), we fall back to the next one instead of
// breaking the upload entirely.
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (r2Configured()) {
    try {
      return await saveToR2(buffer, filename, contentType);
    } catch (err) {
      console.error("R2 upload failed, falling back:", err);
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(filename, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
      });
      return blob.url;
    } catch (err) {
      console.error("Vercel Blob upload failed, falling back:", err);
    }
  }

  ensureDir(UPLOAD_DIR);
  fs.writeFileSync(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);
  return `/api/files/${filename}`;
}
