import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; addendumId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id, addendumId } = await params;
  await db.prepare("DELETE FROM contract_addenda WHERE id = ? AND contract_id = ?").run(addendumId, id);
  return NextResponse.json({ ok: true });
}
