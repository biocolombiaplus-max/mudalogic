import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Lead, LeadFollowup } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [leads, followups] = await Promise.all([
    db
      .prepare("SELECT * FROM leads WHERE status NOT IN ('cerrado', 'perdido') ORDER BY created_at ASC")
      .all<Lead>(),
    db.prepare("SELECT * FROM lead_followups ORDER BY created_at DESC").all<LeadFollowup>(),
  ]);

  return NextResponse.json({ leads, followups });
}
