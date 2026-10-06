import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const description = String(body.description ?? "").trim();
  if (!description) {
    return NextResponse.json({ error: "Falta la descripción del ajuste" }, { status: 400 });
  }

  const addendumId = uuidv4();
  await db
    .prepare("INSERT INTO contract_addenda (id, contract_id, description, amount) VALUES (?, ?, ?, ?)")
    .run(addendumId, id, description.slice(0, 500), String(body.amount ?? "").slice(0, 60));

  return NextResponse.json({ ok: true, id: addendumId });
}
