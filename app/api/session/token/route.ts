import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_TOKEN_COOKIE_KEY,
} from "@/lib/auth-constants";

interface MeResponsePayload {
  user: {
    id: string;
    nombreCompleto: string;
    email: string;
    rol: "USUARIO" | "ADMIN" | "ORGANIZADOR";
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let token = "";

  try {
    const body = (await req.json()) as { token?: string };
    token = String(body?.token || "").trim();
  } catch {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        mensaje: "El token es obligatorio",
      },
      { status: 400 },
    );
  }

  if (!token) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        mensaje: "El token es obligatorio",
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${getApiBaseUrl()}/auth/sync-oauth`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
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

  const payload = (await upstream.json()) as MeResponsePayload;

  if (!payload?.user?.rol) {
    return NextResponse.json(
      {
        error: "AUTH_INVALID_RESPONSE",
        mensaje: "Respuesta de autenticacion invalida",
      },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ user: payload.user }, { status: 200 });

  response.cookies.set(AUTH_TOKEN_COOKIE_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
