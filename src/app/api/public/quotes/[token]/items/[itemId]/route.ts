import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const quote = await db.prepare("SELECT id FROM quotes WHERE token = ?").get<Record<string, unknown>>(token.toUpperCase());
  if (!quote) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });

  await db.prepare("DELETE FROM quote_items WHERE id = ? AND quote_id = ?").run(itemId, quote.id as string);
  return NextResponse.json({ ok: true });
}
