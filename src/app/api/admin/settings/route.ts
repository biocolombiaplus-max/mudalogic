import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { setSetting, getAllSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ settings: await getAllSettings() });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await Promise.all(
    Object.entries(body)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, value]) => setSetting(key, value.slice(0, 20000)))
  );

  return NextResponse.json({ ok: true });
}
