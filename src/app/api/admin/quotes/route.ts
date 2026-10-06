import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const quotes = await db.prepare("SELECT * FROM quotes ORDER BY created_at DESC").all();
  return NextResponse.json({ quotes });
}
