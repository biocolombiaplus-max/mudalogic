import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const EDITABLE_FIELDS = [
  "client_name",
  "client_phone",
  "client_email",
  "origin_address",
  "destination_address",
  "origin_floor",
  "destination_floor",
  "moving_date",
  "moving_size",
  "notes",
  "price",
  "admin_notes",
  "status",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updates: string[] = [];
  const values: string[] = [];
  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      updates.push(`${field} = ?`);
      values.push(String(body[field] ?? ""));
    }
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }
  updates.push("updated_at = NOW()");
  values.push(id);

  await db.prepare(`UPDATE quotes SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
