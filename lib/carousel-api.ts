interface BackendCarruselItem {
  evento_id: string;
}

interface CarruselResponse {
  data: BackendCarruselItem[];
}

function buildJsonHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function sanitizeEventIds(items: BackendCarruselItem[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of items) {
    const id = String(item?.evento_id || "").trim();
    if (!id || seen.has(id)) continue;
    ids.push(id);
    seen.add(id);
    if (ids.length === 6) break;
  }

  return ids;
}

export async function fetchCarouselEventIds(): Promise<string[]> {
  const response = await fetch("/api/proxy/carrusel", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener la configuracion del carrusel: ${response.status}`,
    );
  }

  const payload = (await response.json()) as CarruselResponse;
  const data = Array.isArray(payload.data) ? payload.data : [];
  return sanitizeEventIds(data);
}

export async function updateCarouselEventIds(
  eventIds: string[],
): Promise<string[]> {
  const response = await fetch("/api/proxy/carrusel", {
    method: "PUT",
    headers: buildJsonHeaders(),
    body: JSON.stringify({ eventIds }),
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo guardar la configuracion del carrusel: ${response.status}`,
    );
  }

  const payload = (await response.json()) as CarruselResponse;
  const data = Array.isArray(payload.data) ? payload.data : [];
  return sanitizeEventIds(data);
}
