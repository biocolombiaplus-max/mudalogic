import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db, { generateTrackingCode } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

/** Creates a contract pre-filled with the quote's client data and inventory, editable afterward. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const quote = await db.prepare("SELECT * FROM quotes WHERE id = ?").get<Record<string, unknown>>(id);
  if (!quote) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });

  const items = await db.prepare("SELECT * FROM quote_items WHERE quote_id = ? ORDER BY created_at ASC").all<Record<string, unknown>>(id);

  const contractId = uuidv4();
  const token = await generateTrackingCode();
  await db
    .prepare(
      `INSERT INTO contracts
        (id, token, status, client_name, client_phone, client_email,
         origin_address, destination_address, moving_date, price, notes, created_by)
       VALUES (?, ?, 'enviado', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      contractId,
      token,
      String(quote.client_name ?? ""),
      String(quote.client_phone ?? ""),
      String(quote.client_email ?? ""),
      String(quote.origin_address ?? ""),
      String(quote.destination_address ?? ""),
      String(quote.moving_date ?? ""),
      String(quote.price ?? ""),
      String(quote.notes ?? ""),
      "admin"
    );

  for (const item of items) {
    await db
      .prepare("INSERT INTO inventory_items (id, contract_id, name, category, quantity, condition) VALUES (?, ?, ?, ?, ?, ?)")
      .run(uuidv4(), contractId, String(item.name ?? ""), String(item.category ?? ""), Number(item.quantity) || 1, "Excelente");
  }

  await db
    .prepare("INSERT INTO tracking_events (id, contract_id, status, note) VALUES (?, ?, 'contrato_generado', 'Contrato generado a partir de una cotización')")
    .run(uuidv4(), contractId);

  await db.prepare("UPDATE quotes SET status = 'aceptado', contract_id = ?, updated_at = NOW() WHERE id = ?").run(contractId, id);

  return NextResponse.json({ ok: true, contractId, token });
}
