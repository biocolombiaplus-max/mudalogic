import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { name, phone, origin, destination, moving_size, items, moving_date, message } = body;

  const id = uuidv4();
  db.prepare(
    `INSERT INTO leads (id, name, phone, origin, destination, moving_size, items, moving_date, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    String(name ?? "").slice(0, 200),
    String(phone ?? "").slice(0, 60),
    String(origin ?? "").slice(0, 200),
    String(destination ?? "").slice(0, 200),
    String(moving_size ?? "").slice(0, 200),
    String(items ?? "").slice(0, 500),
    String(moving_date ?? "").slice(0, 60),
    String(message ?? "").slice(0, 1000)
  );

  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return NextResponse.json({ leads });
}
