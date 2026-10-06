import { NextRequest } from "next/server";
import { renderAppIcon } from "@/lib/app-icon";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const requested = Number(req.nextUrl.searchParams.get("size")) || 512;
  const size = Math.min(1024, Math.max(32, requested));
  return renderAppIcon(size);
}
