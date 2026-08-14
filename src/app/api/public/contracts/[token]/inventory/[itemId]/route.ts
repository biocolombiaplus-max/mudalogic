import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const contract = db.prepare("SELECT * FROM contracts WHERE token = ?").get(token.toUpperCase()) as
    | Record<string, unknown>
    | undefined;
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  if (contract.client_signature) {
    return NextResponse.json({ error: "El inventario ya fue firmado y no se puede modificar" }, { status: 409 });
  }

  db.prepare("DELETE FROM inventory_items WHERE id = ? AND contract_id = ?").run(itemId, contract.id as string);
  return NextResponse.json({ ok: true });
}
