import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const CLIENT_EDITABLE_FIELDS = [
  "client_name",
  "client_doc",
  "client_phone",
  "client_email",
  "origin_address",
  "destination_address",
  "moving_date",
  "notes",
];

function getContractByToken(token: string) {
  return db.prepare("SELECT * FROM contracts WHERE token = ?").get<Record<string, unknown>>(token);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await getContractByToken(token.toUpperCase());
  if (!contract) {
    return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  }
  const [inventory, tracking] = await Promise.all([
    db.prepare("SELECT * FROM inventory_items WHERE contract_id = ? ORDER BY created_at ASC").all(contract.id as string),
    db.prepare("SELECT * FROM tracking_events WHERE contract_id = ? ORDER BY created_at ASC").all(contract.id as string),
  ]);

  return NextResponse.json({ contract, inventory, tracking });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await getContractByToken(token.toUpperCase());
  if (!contract) {
    return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
  }
  if (contract.status === "firmado" || contract.status === "recogido" || contract.status === "en_transito" || contract.status === "entregado") {
    return NextResponse.json(
      { error: "Este contrato ya fue firmado y no se puede modificar. Contacta a MudaLogic si necesitas un cambio." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const updates: string[] = [];
  const values: (string | null)[] = [];

  for (const field of CLIENT_EDITABLE_FIELDS) {
    if (field in body) {
      updates.push(`${field} = ?`);
      values.push(String(body[field] ?? "").slice(0, 500));
    }
  }

  if (body.client_signature) {
    updates.push("client_signature = ?", "client_signed_at = NOW()", "client_signed_name = ?");
    values.push(String(body.client_signature), String(body.client_signed_name ?? contract.client_name ?? "").slice(0, 200));
  }
  if (body.staff_signature) {
    updates.push("staff_signature = ?", "staff_signed_at = NOW()", "staff_signed_name = ?");
    values.push(String(body.staff_signature), String(body.staff_signed_name ?? "").slice(0, 200));
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const willBeSigned =
    (body.client_signature || contract.client_signature) && (body.staff_signature || contract.staff_signature);
  if (willBeSigned) {
    updates.push("status = 'firmado'");
  }

  updates.push("updated_at = NOW()");
  values.push(contract.id as string);

  await db.prepare(`UPDATE contracts SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json({ ok: true });
}
