import type { Event } from "@/data/events";

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
  creador_id: string;
  creador_rol: "ORGANIZADOR" | "ADMIN";
}

interface EventosResponse {
  data: BackendEvento[];
}

interface ApiErrorShape {
  mensaje?: string;
  error?: string;
  detalles?: Array<{ mensaje?: string }>;
}

function getEventsEndpoint(): string {
  return `/api/proxy/eventos?limit=100`;
}

function getEventsBaseEndpoint(): string {
  return "/api/proxy/eventos";
}

function getOrganizerEventsEndpoint(): string {
  return "/api/proxy/eventos/mis";
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorShape;
    const detailMessage = payload.detalles?.find(
      (detail) => detail.mensaje,
    )?.mensaje;

    if (detailMessage?.trim()) {
      return detailMessage;
    }

    if (payload.mensaje?.trim()) {
      return payload.mensaje;
    }

    if (payload.error?.trim()) {
      return payload.error;
    }
  } catch {
    // noop
  }

  return fallback;
}

function buildAdminJsonHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  return headers;
}

function buildAdminMultipartHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  return headers;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=700&fit=crop";
const FALLBACK_FLYER =
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=700&h=1200&fit=crop";

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = MONTHS[date.getMonth()] ?? "";
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

function formatTimeLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "00:00";

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapMediosPago(
  medios: BackendEvento["medios_pago"],
): Array<"transferencia" | "mercadopago"> {
  const mapped = medios
    .map((medio) => {
      if (medio === "TRANSFERENCIA_CBU") return "transferencia";
      if (medio === "MERCADO_PAGO") return "mercadopago";
      return null;
    })
    .filter(
      (medio): medio is "transferencia" | "mercadopago" => medio !== null,
    );

  return mapped.length > 0 ? mapped : ["transferencia"];
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
    time: formatTimeLabel(evento.fecha_evento),
    venue,
    provincia: evento.provincia,
    localidad: evento.localidad,
    price: Number(evento.precio),
    category: evento.categoria,
    image: evento.imagen_url || FALLBACK_IMAGE,
    flyer: evento.flyer_url || evento.imagen_url || FALLBACK_FLYER,
    featured: false,
    tags: [evento.categoria.toUpperCase()],
    direccion: evento.direccion,
    organizador: evento.locacion,
    totalEntradas: evento.cantidad_entradas,
    entradasVendidas: evento.entradas_vendidas,
    mediosDePago,
    mercadoPagoId: "",
    cbuCvu: "",
    creatorId: evento.creador_id,
    creatorRole: evento.creador_rol,
    status: evento.estado,
  };
}

function parseDateAndTimeToIso(
  dateLabel: string,
  timeLabel: string,
): string | null {
  const months: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  const match = dateLabel
    .trim()
    .match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+),\s*(\d{4})$/);

  const timeMatch = timeLabel.trim().match(/(\d{1,2}):(\d{2})/);
  const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const minute = timeMatch ? parseInt(timeMatch[2], 10) : 0;

  if (match) {
    const day = parseInt(match[1], 10);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3], 10);

    if (month !== undefined) {
      const date = new Date(year, month, day, hour, minute, 0, 0);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  const fallbackDate = new Date(dateLabel);
  if (Number.isNaN(fallbackDate.getTime())) return null;

  fallbackDate.setHours(hour, minute, 0, 0);
  return fallbackDate.toISOString();
}

function mapFrontendPaymentMethods(
  medios: Array<"transferencia" | "mercadopago">,
): Array<"TRANSFERENCIA_CBU" | "MERCADO_PAGO"> {
  const mapped = medios
    .map((medio) => {
      if (medio === "transferencia") return "TRANSFERENCIA_CBU" as const;
      if (medio === "mercadopago") return "MERCADO_PAGO" as const;
      return null;
    })
    .filter(
      (medio): medio is "TRANSFERENCIA_CBU" | "MERCADO_PAGO" => medio !== null,
    );

  return mapped.length > 0 ? mapped : ["TRANSFERENCIA_CBU"];
}

function buildLocacionFromVenue(venue: string): string {
  const [locacion] = venue.split(",");
  return (locacion || venue).trim() || "Locacion";
}

function buildEventUpdatePayload(
  event: Omit<Event, "id">,
  previousEvent?: Omit<Event, "id">,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const nextValues = {
    titulo: event.title.trim(),
    descripcion: (event.longDescription || event.description).trim(),
    locacion: buildLocacionFromVenue(event.venue),
    direccion: event.direccion.trim(),
    provincia: event.provincia.trim(),
    localidad: event.localidad.trim(),
    precio: Number(event.price) || 0,
    cantidad_entradas: Math.max(1, Number(event.totalEntradas) || 1),
    categoria: event.category.trim(),
    medios_pago: mapFrontendPaymentMethods(event.mediosDePago),
    fecha_evento: parseDateAndTimeToIso(event.date, event.time),
  };

  if (!previousEvent) {
    Object.assign(payload, nextValues);
    if (!payload.fecha_evento) {
      delete payload.fecha_evento;
    }
    return payload;
  }

  const previousValues = {
    titulo: previousEvent.title.trim(),
    descripcion: (
      previousEvent.longDescription || previousEvent.description
    ).trim(),
    locacion: buildLocacionFromVenue(previousEvent.venue),
    direccion: previousEvent.direccion.trim(),
    provincia: previousEvent.provincia.trim(),
    localidad: previousEvent.localidad.trim(),
    precio: Number(previousEvent.price) || 0,
    cantidad_entradas: Math.max(1, Number(previousEvent.totalEntradas) || 1),
    categoria: previousEvent.category.trim(),
    medios_pago: mapFrontendPaymentMethods(previousEvent.mediosDePago),
    fecha_evento: parseDateAndTimeToIso(previousEvent.date, previousEvent.time),
  };

  (Object.keys(nextValues) as Array<keyof typeof nextValues>).forEach((key) => {
    if (
      JSON.stringify(nextValues[key]) !== JSON.stringify(previousValues[key])
    ) {
      if (key === "fecha_evento" && !nextValues[key]) {
        return;
      }
      payload[key] = nextValues[key];
    }
  });

  return payload;
}

function dataUrlToFile(dataUrl: string, filename: string): File | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64 = match[2];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const extension = mimeType.split("/")[1] || "jpg";
  return new File([bytes], `${filename}.${extension}`, { type: mimeType });
}

export async function fetchPublicEvents(): Promise<Event[]> {
  const endpoint = getEventsEndpoint();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener eventos: ${response.status}`);
  }

  const payload = (await response.json()) as EventosResponse;
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data.map((evento) => mapEventoToFrontend(evento));
}

export async function assignEventToCategory(
  eventId: string,
  category: string,
): Promise<void> {
  const response = await fetch(`${getEventsBaseEndpoint()}/${eventId}`, {
    method: "PUT",
    headers: buildAdminJsonHeaders(),
    body: JSON.stringify({ categoria: category }),
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo asignar el evento a la categoria: ${response.status}`,
    );
  }
}

export async function fetchOrganizerEvents(): Promise<Event[]> {
  const response = await fetch(getOrganizerEventsEndpoint(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener eventos del organizador: ${response.status}`,
    );
  }

  const payload = (await response.json()) as EventosResponse;
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data.map((evento) => mapEventoToFrontend(evento));
}

export async function updateEventFromAdmin(
  eventId: string,
  event: Omit<Event, "id">,
  previousEvent?: Omit<Event, "id">,
): Promise<Event> {
  const payload = buildEventUpdatePayload(event, previousEvent);

  if (Object.keys(payload).length === 0) {
    return {
      ...(previousEvent ?? event),
      id: eventId,
    } as Event;
  }

  const response = await fetch(`${getEventsBaseEndpoint()}/${eventId}`, {
    method: "PUT",
    headers: buildAdminJsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        `No se pudo actualizar el evento (${response.status})`,
      ),
    );
  }

  const updated = (await response.json()) as BackendEvento;
  return mapEventoToFrontend(updated);
}

export async function deleteEventFromAdmin(eventId: string): Promise<void> {
  const response = await fetch(`${getEventsBaseEndpoint()}/${eventId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        `No se pudo eliminar el evento (${response.status})`,
      ),
    );
  }
}

export async function createEventFromAdmin(
  event: Omit<Event, "id">,
): Promise<Event> {
  const isoDate = parseDateAndTimeToIso(event.date, event.time);
  if (!isoDate) {
    throw new Error("Fecha del evento invalida");
  }

  const imageFile = dataUrlToFile(event.image, "evento-imagen");
  if (!imageFile) {
    throw new Error("Sube una imagen desde el selector de archivos");
  }

  const flyerFile = dataUrlToFile(event.flyer, "evento-flyer");

  const formData = new FormData();
  formData.append("titulo", event.title);
  formData.append("descripcion", event.longDescription || event.description);
  formData.append("fecha_evento", isoDate);
  formData.append("locacion", buildLocacionFromVenue(event.venue));
  formData.append("direccion", event.direccion);
  formData.append("provincia", event.provincia);
  formData.append("localidad", event.localidad);
  formData.append("precio", String(Number(event.price) || 0));
  formData.append(
    "cantidad_entradas",
    String(Math.max(1, Number(event.totalEntradas) || 1)),
  );
  formData.append("categoria", event.category);
  formData.append(
    "medios_pago",
    JSON.stringify(mapFrontendPaymentMethods(event.mediosDePago)),
  );
  formData.append("imagen", imageFile);
  if (flyerFile) {
    formData.append("flyer", flyerFile);
  }

  const response = await fetch(getEventsBaseEndpoint(), {
    method: "POST",
    headers: buildAdminMultipartHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(
        response,
        `No se pudo crear el evento (${response.status})`,
      ),
    );
  }

  const created = (await response.json()) as BackendEvento;
  return mapEventoToFrontend(created);
}

export async function createEventFromOrganizer(
  event: Omit<Event, "id">,
): Promise<Event> {
  return createEventFromAdmin(event);
}

export async function updateEventFromOrganizer(
  eventId: string,
  event: Omit<Event, "id">,
  previousEvent?: Omit<Event, "id">,
): Promise<Event> {
  return updateEventFromAdmin(eventId, event, previousEvent);
}
