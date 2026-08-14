import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { name, phone, origin, destination, moving_size, items, moving_date, message, source, status } = body;

  // Only an authenticated admin may register a lead already marked "manual"
  // with a custom status; anonymous landing-page submissions always land as
  // a fresh "nuevo" lead sourced from the site.
  const isAdmin = await isAdminAuthenticated();
  const safeSource = isAdmin && source === "manual" ? "manual" : "landing";
  const safeStatus = isAdmin && typeof status === "string" ? status.slice(0, 40) : "nuevo";

  const id = uuidv4();
  await db
    .prepare(
      `INSERT INTO leads (id, name, phone, origin, destination, moving_size, items, moving_date, message, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      String(name ?? "").slice(0, 200),
      String(phone ?? "").slice(0, 60),
      String(origin ?? "").slice(0, 200),
      String(destination ?? "").slice(0, 200),
      String(moving_size ?? "").slice(0, 200),
      String(items ?? "").slice(0, 500),
      String(moving_date ?? "").slice(0, 60),
      String(message ?? "").slice(0, 1000),
      safeSource,
      safeStatus
    );

  return NextResponse.json({ ok: true, id });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const leads = await db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return NextResponse.json({ leads });
}
