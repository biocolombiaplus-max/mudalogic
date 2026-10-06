import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const contract = await db
    .prepare("SELECT * FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  if (contract.client_signature) {
    return NextResponse.json({ error: "El inventario ya fue firmado y no se puede modificar" }, { status: 409 });
  }

  await db.prepare("DELETE FROM inventory_items WHERE id = ? AND contract_id = ?").run(itemId, contract.id as string);
  return NextResponse.json({ ok: true });
}

/** Used by the driver's loading checklist to mark an item as loaded and/or leave a note. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const contract = await db
    .prepare("SELECT id FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updates: string[] = [];
  const values: (string | boolean)[] = [];

  if ("loaded" in body) {
    updates.push("loaded = ?");
    values.push(Boolean(body.loaded));
  }
  if ("driver_note" in body) {
    updates.push("driver_note = ?");
    values.push(String(body.driver_note ?? "").slice(0, 500));
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  await db
    .prepare(`UPDATE inventory_items SET ${updates.join(", ")} WHERE id = ? AND contract_id = ?`)
    .run(...values, itemId, contract.id as string);

  return NextResponse.json({ ok: true });
}
