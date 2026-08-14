import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "mudalogic_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || "mudalogic-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
