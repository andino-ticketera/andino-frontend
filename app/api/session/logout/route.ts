import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_KEY } from "@/lib/auth-constants";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(AUTH_TOKEN_COOKIE_KEY, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
