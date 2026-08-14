import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { setSetting, getAllSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ settings: getAllSettings() });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      setSetting(key, value.slice(0, 20000));
    }
  }

  return NextResponse.json({ ok: true });
}
