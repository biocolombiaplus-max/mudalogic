import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifyAdminPassword, setAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");

  if (!(await verifyAdminPassword(current))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
  }
  if (next.length < 4) {
    return NextResponse.json({ error: "La nueva contraseña debe tener al menos 4 caracteres" }, { status: 400 });
  }

  await setAdminPassword(next);
  return NextResponse.json({ ok: true });
}
