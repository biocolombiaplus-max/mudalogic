import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password ?? "");

  if (!password || !(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
