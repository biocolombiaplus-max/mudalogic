import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; photoId: string }> }
) {
  const { token, photoId } = await params;
  const contract = await db
    .prepare("SELECT id FROM contracts WHERE token = ?")
    .get<Record<string, unknown>>(token.toUpperCase());
  if (!contract) return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });

  await db
    .prepare("DELETE FROM contract_photos WHERE id = ? AND contract_id = ?")
    .run(photoId, contract.id as string);

  return NextResponse.json({ ok: true });
}
