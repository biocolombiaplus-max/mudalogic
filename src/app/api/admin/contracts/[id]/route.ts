import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const EDITABLE_FIELDS = [
  "client_name",
  "client_doc",
  "client_phone",
  "client_email",
  "origin_address",
  "destination_address",
  "moving_date",
  "service_type",
  "price",
  "notes",
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
  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE contracts SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  db.prepare("DELETE FROM contracts WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
