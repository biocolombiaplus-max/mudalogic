import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "").slice(0, 40);
  if (!status) return NextResponse.json({ error: "Estado requerido" }, { status: 400 });

  await db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
