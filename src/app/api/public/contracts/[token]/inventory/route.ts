import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await db
    .prepare("SELECT * FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const isAdditional = Boolean(body.is_additional);

  // The original inventory locks once the client signs — but the driver can still flag extra
  // items found at loading time, which are kept separate and marked as additional charges.
  if (contract.client_signature && !isAdditional) {
    return NextResponse.json({ error: "El inventario ya fue firmado y no se puede modificar" }, { status: 409 });
  }

  const id = uuidv4();
  await db
    .prepare(
      `INSERT INTO inventory_items (id, contract_id, name, category, quantity, condition, photo, is_additional, loaded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      contract.id as string,
      String(body.name ?? "").slice(0, 200),
      String(body.category ?? "").slice(0, 100),
      Math.max(1, Math.min(999, Number(body.quantity) || 1)),
      String(body.condition ?? "").slice(0, 200),
      body.photo ? String(body.photo).slice(0, 600) : null,
      isAdditional,
      isAdditional
    );

  return NextResponse.json({ ok: true, id });
}
