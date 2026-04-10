import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import { AUTH_TOKEN_COOKIE_KEY } from "@/lib/auth-constants";

interface MeResponsePayload {
  user: {
    id: string;
    nombreCompleto: string;
    email: string;
    rol: "USUARIO" | "ADMIN" | "ORGANIZADOR";
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "NO_AUTENTICADO", mensaje: "Debe iniciar sesión" },
      { status: 401 },
    );
  }

  const upstream = await fetch(`${getApiBaseUrl()}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
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

  return NextResponse.json(payload, { status: 200 });
}
