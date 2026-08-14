import path from "path";
import os from "os";
import fs from "fs";

// On Vercel (and other read-only serverless filesystems) only /tmp is
// writable, and it does not persist between invocations/deploys. Locally,
// or on a host with a persistent disk (VPS, Railway, Render, etc.), we use
// real project folders so data survives restarts.
const IS_SERVERLESS = Boolean(process.env.VERCEL);

export const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), "mudalogic-data")
  : path.join(process.cwd(), "data");

export const UPLOAD_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), "mudalogic-uploads")
  : path.join(process.cwd(), "public", "uploads");

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
