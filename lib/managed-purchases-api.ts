import type { Purchase } from "@/data/purchases";
import type { PublicCheckoutStatus } from "@/lib/mercadopago-api";

interface BackendManagedPurchase {
  id: string;
  user_id: string | null;
  evento_id: string;
  evento_titulo: string;
  fecha_evento: string;
  nombre_organizador: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  metodo_pago: "TRANSFERENCIA_CBU" | "MERCADO_PAGO";
  estado: "PENDIENTE" | "PAGADO" | "CANCELADO";
  fecha_compra: string;
  comprador_nombre: string;
  comprador_apellido: string;
  comprador_email: string;
  comprador_documento: string;
  comprador_tipo_documento: string;
  entradas_usadas: number;
}

interface ManagedPurchasesResponse {
  data?: BackendManagedPurchase[];
}

interface CheckInResponse {
  data?: {
    compraId: string;
    entradasUsadas: number;
  };
}

interface PurchaseActionResponse {
  data?: {
    compraId: string;
    mensaje?: string;
  };
}

function buildJsonHeaders(): HeadersInit {
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
    // noop
  }

  return `No se pudo completar la operacion (${response.status})`;
}

function mapPurchase(item: BackendManagedPurchase): Purchase {
  return {
    id: item.id,
    userId: item.user_id,
    eventId: item.evento_id,
    eventTitle: item.evento_titulo,
    eventDate: item.fecha_evento,
    organizerName: item.nombre_organizador,
    firstName: item.comprador_nombre,
    lastName: item.comprador_apellido,
    dniType: item.comprador_tipo_documento || "DNI",
    dniNumber: item.comprador_documento,
    email: item.comprador_email,
    quantity: Number(item.cantidad || 0),
    unitPrice: Number(item.precio_unitario || 0),
    totalPrice: Number(item.precio_total || 0),
    paymentMethod: item.metodo_pago,
    status: item.estado,
    purchaseDate: item.fecha_compra,
    checkedInCount: Number(item.entradas_usadas || 0),
  };
}

async function fetchManagedPurchases(endpoint: string): Promise<Purchase[]> {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as ManagedPurchasesResponse;
  return Array.isArray(payload.data) ? payload.data.map(mapPurchase) : [];
}

export async function fetchAdminPurchases(): Promise<Purchase[]> {
  return fetchManagedPurchases("/api/proxy/compras/admin");
}

export async function fetchOrganizerPurchases(): Promise<Purchase[]> {
  return fetchManagedPurchases("/api/proxy/compras/organizador");
}

export function isManagedPurchasePaid(purchase: Purchase): boolean {
  return purchase.status === "PAGADO";
}

export async function updateOrganizerPurchaseCheckIn(
  purchaseId: string,
  checkedIn: boolean,
): Promise<number> {
  const response = await fetch(
    `/api/proxy/compras/organizador/${purchaseId}/checkin`,
    {
      method: "PATCH",
      headers: buildJsonHeaders(),
      body: JSON.stringify({ checkedIn }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as CheckInResponse;
  return Number(payload.data?.entradasUsadas || 0);
}

async function resendManagedPurchaseEmail(endpoint: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildJsonHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as PurchaseActionResponse;
  return payload.data?.mensaje?.trim() || "Email reenviado correctamente";
}

export async function resendAdminPurchaseEmail(
  purchaseId: string,
): Promise<string> {
  return resendManagedPurchaseEmail(
    `/api/proxy/compras/admin/${purchaseId}/resend-email`,
  );
}

export async function resendOrganizerPurchaseEmail(
  purchaseId: string,
): Promise<string> {
  return resendManagedPurchaseEmail(
    `/api/proxy/compras/organizador/${purchaseId}/resend-email`,
  );
}

export function getManagedPaymentMethodLabel(
  method: Purchase["paymentMethod"],
): string {
  return method === "MERCADO_PAGO" ? "Mercado Pago" : "Transferencia bancaria";
}

export function getManagedPurchaseStatusLabel(
  status: Purchase["status"],
): string {
  switch (status) {
    case "PAGADO":
      return "Pagado";
    case "PENDIENTE":
      return "Pendiente";
    case "CANCELADO":
      return "Cancelado";
  }
}

export function getManagedPurchaseStatusColor(
  status: Purchase["status"],
): string {
  switch (status) {
    case "PAGADO":
      return "var(--color-primary)";
    case "PENDIENTE":
      return "#f4b942";
    case "CANCELADO":
      return "#ff8f8f";
  }
}

export function formatManagedPurchaseDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getPurchaseCheckInLabel(purchase: Purchase): string {
  if (purchase.checkedInCount <= 0) return "Ausente";
  if (purchase.checkedInCount >= purchase.quantity) return "Presente";
  return `${purchase.checkedInCount}/${purchase.quantity} presentes`;
}

export function isManagedPurchaseCurrent(purchase: Purchase): boolean {
  const eventTime = new Date(purchase.eventDate).getTime();
  return !Number.isNaN(eventTime) && eventTime > Date.now();
}

export function canResendManagedPurchaseEmail(purchase: Purchase): boolean {
  return isManagedPurchasePaid(purchase) && isManagedPurchaseCurrent(purchase);
}

export function buildPurchaseConfirmationStatus(
  purchase: Purchase,
): PublicCheckoutStatus {
  return {
    compraId: purchase.id,
    estado: purchase.status,
    mpStatus: null,
    eventoTitulo: purchase.eventTitle,
    eventDate: purchase.eventDate,
    cantidad: purchase.quantity,
    total: purchase.totalPrice,
    compradorEmail: purchase.email,
    createdAt: purchase.purchaseDate,
  };
}
