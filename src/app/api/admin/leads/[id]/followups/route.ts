import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const ALLOWED_TYPES = new Set(["manual", "reminder_8", "reminder_15"]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const type = ALLOWED_TYPES.has(body.type) ? body.type : "manual";
  const note = String(body.note ?? "").slice(0, 1000);

  const lead = await db.prepare("SELECT id FROM leads WHERE id = ?").get(id);
  if (!lead) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });

  const followupId = uuidv4();
  await db
    .prepare("INSERT INTO lead_followups (id, lead_id, type, note) VALUES (?, ?, ?, ?)")
    .run(followupId, id, type, note);

  return NextResponse.json({ ok: true, id: followupId });
}
