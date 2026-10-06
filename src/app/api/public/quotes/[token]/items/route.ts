import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await db.prepare("SELECT id FROM quotes WHERE token = ?").get<Record<string, unknown>>(token.toUpperCase());
  if (!quote) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const id = uuidv4();
  await db
    .prepare("INSERT INTO quote_items (id, quote_id, name, category, quantity) VALUES (?, ?, ?, ?, ?)")
    .run(
      id,
      quote.id as string,
      String(body.name ?? "").slice(0, 200),
      String(body.category ?? "").slice(0, 100),
      Math.max(1, Math.min(999, Number(body.quantity) || 1))
    );

  return NextResponse.json({ ok: true, id });
}
