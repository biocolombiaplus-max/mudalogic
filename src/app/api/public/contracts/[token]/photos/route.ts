import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** Cargo/loading-evidence photos the driver uploads when picking up the move — separate from the
 * client's per-item inventory photos, and allowed even after the client has already signed. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await db
    .prepare("SELECT id FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

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

  const ext = EXT_BY_TYPE[file.type] ?? "";
  const filename = `${uuidv4()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedFile(buffer, filename, file.type);

  const id = uuidv4();
  await db
    .prepare("INSERT INTO contract_photos (id, contract_id, url) VALUES (?, ?, ?)")
    .run(id, contract.id as string, url);

  return NextResponse.json({ id, url });
}
