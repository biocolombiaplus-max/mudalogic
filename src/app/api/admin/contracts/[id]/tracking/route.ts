import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "").slice(0, 60);
  if (!status) return NextResponse.json({ error: "Estado requerido" }, { status: 400 });

  const eventId = uuidv4();
  await db
    .prepare(`INSERT INTO tracking_events (id, contract_id, status, note, location) VALUES (?, ?, ?, ?, ?)`)
    .run(eventId, id, status, String(body.note ?? "").slice(0, 500), String(body.location ?? "").slice(0, 200));

  const contractStatusMap: Record<string, string> = {
    recogido: "recogido",
    en_bodega: "en_transito",
    en_ruta: "en_transito",
    en_ciudad_destino: "en_transito",
    en_reparto: "en_transito",
    entregado: "entregado",
  };
  if (contractStatusMap[status]) {
    await db
      .prepare("UPDATE contracts SET status = ?, updated_at = NOW() WHERE id = ?")
      .run(contractStatusMap[status], id);
  }

  return NextResponse.json({ ok: true, id: eventId });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await params;
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId requerido" }, { status: 400 });
  await db.prepare("DELETE FROM tracking_events WHERE id = ?").run(eventId);
  return NextResponse.json({ ok: true });
}
