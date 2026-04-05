import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import { AUTH_TOKEN_COOKIE_KEY } from "@/lib/auth-constants";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handleProxy(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;

  const base = getApiBaseUrl().replace(/\/$/, "");
  const target = new URL(`${base}/${path.join("/")}`);
  target.search = req.nextUrl.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const accept = req.headers.get("accept");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);

  const token = req.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const raw = await req.arrayBuffer();
    if (raw.byteLength > 0) {
      body = raw;
    }
  }

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleProxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleProxy(req, context);
}

export async function PUT(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleProxy(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleProxy(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleProxy(req, context);
}
