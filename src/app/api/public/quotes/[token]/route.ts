import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSetting } from "@/lib/settings";

const CLIENT_EDITABLE_FIELDS = [
  "client_name",
  "client_phone",
  "client_email",
  "origin_address",
  "destination_address",
  "origin_floor",
  "destination_floor",
  "moving_date",
  "notes",
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await db.prepare("SELECT * FROM quotes WHERE token = ?").get<Record<string, unknown>>(token.toUpperCase());
  if (!quote) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });

  const [items, companyWhatsapp] = await Promise.all([
    db.prepare("SELECT * FROM quote_items WHERE quote_id = ? ORDER BY created_at ASC").all(quote.id as string),
    getSetting("site.whatsapp", ""),
  ]);
  return NextResponse.json({ quote, items, companyWhatsapp });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await db.prepare("SELECT * FROM quotes WHERE token = ?").get<Record<string, unknown>>(token.toUpperCase());
  if (!quote) return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  if (quote.status !== "nuevo") {
    return NextResponse.json({ error: "Esta cotización ya fue enviada y no se puede modificar." }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: string[] = [];
  const values: string[] = [];

  for (const field of CLIENT_EDITABLE_FIELDS) {
    if (field in body) {
      updates.push(`${field} = ?`);
      values.push(String(body[field] ?? "").slice(0, 400));
    }
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  updates.push("updated_at = NOW()");
  values.push(quote.id as string);
  await db.prepare(`UPDATE quotes SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json({ ok: true });
}
