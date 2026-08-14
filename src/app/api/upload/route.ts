import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
    return NextResponse.json({ error: "La imagen supera el tamaño máximo de 10MB" }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type] ?? "";
  const filename = `${uuidv4()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedFile(buffer, filename, file.type);

  return NextResponse.json({ url });
}
