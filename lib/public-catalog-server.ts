import "server-only";

import type { Event } from "@/data/events";
import { buildApiUrl } from "@/lib/api-base";
import type { BackendCategoria } from "@/lib/categories-api";

interface BackendEvento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  locacion: string;
  direccion: string;
  provincia: string;
  localidad: string;
  precio: number;
  cantidad_entradas: number;
  entradas_vendidas: number;
  categoria: string;
  imagen_url: string;
  flyer_url: string | null;
  medios_pago: Array<"TRANSFERENCIA_CBU" | "MERCADO_PAGO">;
  estado: "ACTIVO" | "AGOTADO" | "CANCELADO";
  visible_en_app: boolean;
  creador_id: string;
  creador_rol: "ORGANIZADOR" | "ADMIN";
  nombre_organizador?: string;
}

interface EventosResponse {
  data: BackendEvento[];
}

interface CategoriasResponse {
  data: BackendCategoria[];
}

interface BackendCarruselItem {
  evento_id: string;
}

interface CarruselResponse {
  data: BackendCarruselItem[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=700&fit=crop";
const FALLBACK_FLYER =
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=700&h=1200&fit=crop";
const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: ARG_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const rawMonth = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

  return `${day} ${month}, ${year}`;
}

function formatTimeLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "00:00";

  return date.toLocaleTimeString("es-AR", {
    timeZone: ARG_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapMediosPago(
  medios?: BackendEvento["medios_pago"],
): Array<"mercadopago"> {
  void medios;
  // Por el momento el unico medio de cobro es Mercado Pago.
  return ["mercadopago"];
}

function mapEventoToFrontend(evento: BackendEvento): Event {
  const mediosDePago = mapMediosPago(evento.medios_pago);
  const venue = `${evento.locacion}, ${evento.localidad}`;

  return {
    id: evento.id,
    title: evento.titulo,
    description: evento.descripcion,
    longDescription: evento.descripcion,
    date: formatDateLabel(evento.fecha_evento),
    eventDateIso: evento.fecha_evento,
    time: formatTimeLabel(evento.fecha_evento),
    venue,
    provincia: evento.provincia,
    localidad: evento.localidad,
    price: Number(evento.precio),
    category: evento.categoria,
    image: evento.imagen_url || evento.flyer_url || FALLBACK_IMAGE,
    flyer: evento.flyer_url || evento.imagen_url || FALLBACK_FLYER,
    featured: false,
    tags: [evento.categoria.toUpperCase()],
    direccion: evento.direccion,
    organizador: evento.nombre_organizador || "",
    totalEntradas: evento.cantidad_entradas,
    entradasVendidas: evento.entradas_vendidas,
    mediosDePago,
    mercadoPagoId: "",
    creatorId: evento.creador_id,
    creatorRole: evento.creador_rol,
    status: evento.estado,
    visibleInApp: evento.visible_en_app !== false,
  };
}

async function fetchJson<T>(path: string, errorMessage: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchPublicEventsServer(): Promise<Event[]> {
  const payload = await fetchJson<EventosResponse>(
    "/eventos?limit=100",
    "No se pudo obtener eventos",
  );
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data.map((evento) => mapEventoToFrontend(evento));
}

export async function fetchPublicCategoriesServer(): Promise<BackendCategoria[]> {
  const payload = await fetchJson<CategoriasResponse>(
    "/categorias",
    "No se pudo obtener categorias",
  );
  const data = Array.isArray(payload.data) ? payload.data : [];

  return data.filter(
    (categoria) =>
      typeof categoria?.id === "string" &&
      categoria.id.trim().length > 0 &&
      typeof categoria?.nombre === "string" &&
      categoria.nombre.trim().length > 0,
  );
}

export async function fetchCarouselEventIdsServer(): Promise<string[]> {
  const payload = await fetchJson<CarruselResponse>(
    "/carrusel",
    "No se pudo obtener la configuracion del carrusel",
  );
  const data = Array.isArray(payload.data) ? payload.data : [];
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of data) {
    const id = String(item?.evento_id || "").trim();
    if (!id || seen.has(id)) continue;
    ids.push(id);
    seen.add(id);
    if (ids.length === 6) break;
  }

  return ids;
}
