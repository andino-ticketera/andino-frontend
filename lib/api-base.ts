export function getApiBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!raw) {
    throw new Error("Falta configurar API_BASE_URL o NEXT_PUBLIC_API_BASE_URL");
  }

  const trimmed = raw.replace(/\/$/, "");
  const url = new URL(trimmed);
  const path = url.pathname.replace(/\/$/, "");

  // If only origin is configured, default API prefix remains /api.
  if (!path || path === "/") {
    url.pathname = "/api";
  }

  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
