import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = db.prepare("SELECT id FROM contracts WHERE token = ?").get(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const ok = verifyAdminPassword(String(body.password ?? ""));
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
