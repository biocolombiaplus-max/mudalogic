import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import db from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = db.prepare("SELECT id, client_signature FROM contracts WHERE token = ?").get(
    token.toUpperCase()
  ) as Record<string, unknown> | undefined;
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  if (contract.client_signature) {
    return NextResponse.json({ error: "El inventario ya fue firmado y no se puede modificar" }, { status: 409 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no permitido" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo de 8MB" }, { status: 400 });
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = EXT_BY_TYPE[file.type] ?? "";
  const filename = `${uuidv4()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
