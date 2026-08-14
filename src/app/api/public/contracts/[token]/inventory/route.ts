import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = db.prepare("SELECT * FROM contracts WHERE token = ?").get(token.toUpperCase()) as
    | Record<string, unknown>
    | undefined;
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  if (contract.client_signature) {
    return NextResponse.json({ error: "El inventario ya fue firmado y no se puede modificar" }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const id = uuidv4();
  db.prepare(
    `INSERT INTO inventory_items (id, contract_id, name, category, quantity, condition, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    contract.id as string,
    String(body.name ?? "").slice(0, 200),
    String(body.category ?? "").slice(0, 100),
    Math.max(1, Math.min(999, Number(body.quantity) || 1)),
    String(body.condition ?? "").slice(0, 200),
    body.photo ? String(body.photo).slice(0, 500) : null
  );

  return NextResponse.json({ ok: true, id });
}
