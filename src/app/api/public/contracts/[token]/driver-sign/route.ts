import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await db
    .prepare("SELECT id FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const signature = String(body.signature ?? "");
  const name = String(body.name ?? "").slice(0, 200);
  if (!signature || !name) {
    return NextResponse.json({ error: "Falta el nombre o la firma" }, { status: 400 });
  }

  await db
    .prepare(
      `UPDATE contracts
       SET driver_signature = ?, driver_signed_at = NOW(), driver_signed_name = ?, updated_at = NOW()
       WHERE id = ?`
    )
    .run(signature, name, contract.id as string);

  await db
    .prepare("INSERT INTO tracking_events (id, contract_id, status, note) VALUES (?, ?, 'recogido', 'Cargue confirmado y firmado por el conductor')")
    .run(uuidv4(), contract.id as string);

  return NextResponse.json({ ok: true });
}
