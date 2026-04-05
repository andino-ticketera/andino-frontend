import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_TOKEN_COOKIE_KEY,
} from "@/lib/auth-constants";

interface AuthResponsePayload {
  token: string;
  user: {
    id: string;
    nombreCompleto: string;
    email: string;
    rol: "USUARIO" | "ADMIN" | "ORGANIZADOR";
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();

  const upstream = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!upstream.ok) {
    const errorBody = await upstream.text();
    return new NextResponse(errorBody, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  }

  const payload = (await upstream.json()) as AuthResponsePayload;

  if (!payload?.token || !payload?.user) {
    return NextResponse.json(
      {
        error: "AUTH_INVALID_RESPONSE",
        mensaje: "Respuesta de autenticacion invalida",
      },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ user: payload.user }, { status: 200 });

  response.cookies.set(AUTH_TOKEN_COOKIE_KEY, payload.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
