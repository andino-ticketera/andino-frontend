export type EstadoCompra = "PENDIENTE" | "PAGADO" | "CANCELADO";
export type MetodoPago = "TRANSFERENCIA_CBU" | "MERCADO_PAGO";

export interface Compra {
  id: string;
  user_id: string;
  evento_id: string;
  evento_titulo: string;
  fecha_evento: string;
  ubicacion_evento: string;
  nombre_organizador: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  metodo_pago: MetodoPago;
  estado: EstadoCompra;
  fecha_compra: string;
}

export interface EntradaResumen {
  id: string;
  numero_entrada: number;
  qr_token?: string;
  estado: "DISPONIBLE" | "USADA";
  fecha_uso?: string;
}

export interface CompraDetalle extends Compra {
  entradas: EntradaResumen[];
}

export interface EntradaCompleta {
  entrada_id: string;
  compra_id: string;
  numero_entrada: number;
  qr_token: string;
  qr_data: string;
  qr_image_data_url: string;
  estado: "DISPONIBLE" | "USADA";
  fecha_uso?: string;
  evento: {
    id: string;
    titulo: string;
    fecha_evento: string;
    locacion: string;
    direccion: string;
    organizador: string;
  };
  comprador: {
    id: string;
    nombre_completo: string;
    email: string;
  };
}

export interface BuyerProfile {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipoDocumento: string;
}

interface ComprasResponse {
  data: Compra[];
}

interface BuyerProfileResponse {
  data: BuyerProfile | null;
}

interface CompraDetalleResponse {
  data: CompraDetalle;
}

interface EntradaResponse {
  data: EntradaCompleta;
}

function buildAuthHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      mensaje?: string;
      error?: string;
    };

    if (payload?.mensaje) return payload.mensaje;
    if (payload?.error) return payload.error;
  } catch {
    // Ignore parse errors.
  }

  return response.statusText || `Error HTTP ${response.status}`;
}

export async function fetchMisCompras(): Promise<Compra[]> {
  const response = await fetch("/api/proxy/compras/mias", {
    method: "GET",
    headers: buildAuthHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado");
    }

    throw new Error(await parseApiError(response));
  }

  const json: ComprasResponse = await response.json();
  return json.data;
}

export async function fetchBuyerProfile(): Promise<BuyerProfile | null> {
  const response = await fetch("/api/proxy/compras/mias/perfil-comprador", {
    method: "GET",
    headers: buildAuthHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado");
    }

    throw new Error(await parseApiError(response));
  }

  const json: BuyerProfileResponse = await response.json();
  return json.data;
}

export async function fetchCompraDetalle(id: string): Promise<CompraDetalle> {
  const response = await fetch(`/api/proxy/compras/mias/${id}`, {
    method: "GET",
    headers: buildAuthHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado");
    }
    if (response.status === 404) {
      throw new Error("Compra no encontrada");
    }

    throw new Error(await parseApiError(response));
  }

  const json: CompraDetalleResponse = await response.json();
  return json.data;
}

export async function fetchEntradaCompleta(
  id: string,
): Promise<EntradaCompleta> {
  const response = await fetch(`/api/proxy/entradas/mias/${id}`, {
    method: "GET",
    headers: buildAuthHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado");
    }
    if (response.status === 404) {
      throw new Error("Entrada no encontrada");
    }
    if (response.status === 400) {
      throw new Error(await parseApiError(response));
    }

    throw new Error(await parseApiError(response));
  }

  const json: EntradaResponse = await response.json();
  return json.data;
}

export function formatFechaCompra(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFechaEvento(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(precio);
}

export function getEstadoCompraBadgeColor(estado: EstadoCompra): string {
  switch (estado) {
    case "PAGADO":
      return "var(--color-primary)";
    case "PENDIENTE":
      return "#ffcc66";
    case "CANCELADO":
      return "#ff8f8f";
  }
}

export function getEstadoCompraLabel(estado: EstadoCompra): string {
  switch (estado) {
    case "PAGADO":
      return "Pagado";
    case "PENDIENTE":
      return "Pendiente";
    case "CANCELADO":
      return "Cancelado";
  }
}

export function getMetodoPagoLabel(metodo: MetodoPago): string {
  switch (metodo) {
    case "MERCADO_PAGO":
      return "Mercado Pago";
    case "TRANSFERENCIA_CBU":
      return "Transferencia bancaria";
  }
}

export function getEstadoEntradaLabel(estado: "DISPONIBLE" | "USADA"): string {
  return estado === "USADA" ? "Usada" : "Disponible";
}
