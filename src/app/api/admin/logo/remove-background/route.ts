import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";
import { saveUploadedFile } from "@/lib/storage";
import { removeFlatBackgroundServer } from "@/lib/removeBackgroundServer";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const logoUrl = await getSetting("site.logo", "");
  if (!logoUrl) {
    return NextResponse.json({ error: "No hay un logo cargado todavía" }, { status: 400 });
  }

  const absoluteUrl = logoUrl.startsWith("http") ? logoUrl : new URL(logoUrl, req.nextUrl.origin).toString();

  let buffer: Buffer;
  try {
    const res = await fetch(absoluteUrl);
    if (!res.ok) throw new Error();
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "No se pudo descargar el logo actual" }, { status: 500 });
  }

  let processed: Buffer;
  try {
    processed = await removeFlatBackgroundServer(buffer);
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 500 });
  }

  const filename = `${uuidv4()}.png`;
  const url = await saveUploadedFile(processed, filename, "image/png");
  await setSetting("site.logo", url);

  return NextResponse.json({ url });
}
