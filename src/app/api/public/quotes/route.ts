import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db, { generateQuoteCode } from "@/lib/db";

/** Anyone visiting the site can start a quote — no admin step required first. */
export async function POST() {
  const id = uuidv4();
  const token = await generateQuoteCode();
  await db.prepare("INSERT INTO quotes (id, token, status) VALUES (?, ?, 'nuevo')").run(id, token);
  return NextResponse.json({ id, token });
}
