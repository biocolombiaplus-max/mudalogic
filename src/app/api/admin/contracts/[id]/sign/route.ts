import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { LEGAL_REPRESENTATIVE } from "@/lib/types";

/** The legal representative (always Manuel Alejandro Barbosa Pérez) signs the contract from the admin panel. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const signature = String(body.signature ?? "");
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  await db
    .prepare(
      `UPDATE contracts
       SET staff_signature = ?, staff_signed_at = NOW(), staff_signed_name = ?, status = 'firmado', updated_at = NOW()
       WHERE id = ?`
    )
    .run(signature, LEGAL_REPRESENTATIVE.name, id);

  return NextResponse.json({ ok: true });
}
