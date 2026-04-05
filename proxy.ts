import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_KEY } from "@/lib/auth-constants";
import { getApiBaseUrl } from "@/lib/api-base";

type UserRole = "USUARIO" | "ADMIN" | "ORGANIZADOR";

const VALID_ROLES = new Set<UserRole>(["USUARIO", "ADMIN", "ORGANIZADOR"]);

async function getRoleFromToken(
  request: NextRequest,
): Promise<UserRole | null> {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      user?: { rol?: string };
    };

    const rawRole = String(payload.user?.rol || "")
      .trim()
      .toUpperCase() as UserRole;

    return VALID_ROLES.has(rawRole) ? rawRole : null;
  } catch {
    return null;
  }
}

function redirectToHome(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const role = await getRoleFromToken(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!role) return redirectToHome(request);
    if (role !== "ADMIN") {
      return redirectToHome(request);
    }
  }

  if (pathname.startsWith("/organizador/dashboard")) {
    if (!role) return redirectToHome(request);
    if (role !== "ORGANIZADOR") {
      return redirectToHome(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/organizador/dashboard/:path*"],
};
