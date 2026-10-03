import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db, { generateTrackingCode } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const contracts = await db.prepare("SELECT * FROM contracts ORDER BY created_at DESC").all();
  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  const id = uuidv4();
  const token = await generateTrackingCode();

  await db
    .prepare(
      `INSERT INTO contracts
        (id, token, status, client_name, client_doc, client_phone, client_email,
         origin_address, destination_address, moving_date, service_type, price, notes,
         driver_name, driver_doc, driver_phone, vehicle_plate,
         pickup_datetime, completion_datetime,
         freight_value, advance_value, balance_due,
         policy_number, insurance_company, insured_amount, insurance_value,
         created_by)
       VALUES (?, ?, 'enviado', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      token,
      String(body.client_name ?? "").slice(0, 200),
      String(body.client_doc ?? "").slice(0, 60),
      String(body.client_phone ?? "").slice(0, 60),
      String(body.client_email ?? "").slice(0, 200),
      String(body.origin_address ?? "").slice(0, 300),
      String(body.destination_address ?? "").slice(0, 300),
      String(body.moving_date ?? "").slice(0, 60),
      String(body.service_type ?? "").slice(0, 200),
      String(body.price ?? "").slice(0, 60),
      String(body.notes ?? "").slice(0, 2000),
      String(body.driver_name ?? "").slice(0, 200),
      String(body.driver_doc ?? "").slice(0, 60),
      String(body.driver_phone ?? "").slice(0, 60),
      String(body.vehicle_plate ?? "").slice(0, 30),
      String(body.pickup_datetime ?? "").slice(0, 60),
      String(body.completion_datetime ?? "").slice(0, 60),
      String(body.freight_value ?? "").slice(0, 60),
      String(body.advance_value ?? "").slice(0, 60),
      String(body.balance_due ?? "").slice(0, 60),
      String(body.policy_number ?? "").slice(0, 100),
      String(body.insurance_company ?? "").slice(0, 200),
      String(body.insured_amount ?? "").slice(0, 60),
      String(body.insurance_value ?? "").slice(0, 60),
      "admin"
    );

  await db
    .prepare(
      `INSERT INTO tracking_events (id, contract_id, status, note) VALUES (?, ?, 'contrato_generado', 'Contrato de servicio generado')`
    )
    .run(uuidv4(), id);

  return NextResponse.json({ ok: true, id, token });
}
