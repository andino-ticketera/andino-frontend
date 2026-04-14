interface ApiErrorShape {
  mensaje?: string;
  error?: string;
}

export interface MercadoPagoConnectionStatus {
  status: "NO_CONECTADA" | "CONECTADA" | "REQUIERE_RECONEXION" | "DESCONECTADA";
  mpEmail: string | null;
  mpUserId: string | null;
  connectedAt: string | null;
  publicKey: string | null;
  mode: "oauth" | "platform_test" | "not_configured";
}

export interface CheckoutPreferenceInput {
  eventoId: string;
  cantidad: number;
  buyer: {
    nombre: string;
    apellido: string;
    email: string;
    documento: string;
    tipoDocumento?: string;
  };
}

export interface CheckoutPreferenceResult {
  compraId: string;
  preferenceId: string;
  publicKey: string;
  checkoutUrl: string;
  precioBase: number;
  costoServicio: number;
  total: number;
}

export interface PublicCheckoutStatus {
  compraId: string;
  estado: "PENDIENTE" | "PAGADO" | "CANCELADO";
  mpStatus: string | null;
  eventoTitulo: string;
  eventDate: string;
  cantidad: number;
  total: number;
  compradorEmail: string;
  createdAt: string;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorShape;
    if (payload.mensaje?.trim()) return payload.mensaje;
    if (payload.error?.trim()) return payload.error;
  } catch {
    // noop
  }

  return `Error de Mercado Pago (${response.status})`;
}

export async function fetchOrganizerMercadoPagoStatus(): Promise<MercadoPagoConnectionStatus> {
  const response = await fetch("/api/proxy/organizador/mercado-pago/status", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as {
    data?: MercadoPagoConnectionStatus;
  };

  if (!payload.data) {
    throw new Error("Respuesta invalida de estado Mercado Pago");
  }

  return payload.data;
}

export async function fetchOrganizerMercadoPagoConnectUrl(): Promise<string> {
  const response = await fetch(
    "/api/proxy/organizador/mercado-pago/connect-url",
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as { data?: { url?: string } };
  const url = payload.data?.url?.trim();
  if (!url) {
    throw new Error("No se pudo obtener la URL de conexion de Mercado Pago");
  }

  return url;
}

export async function createCheckoutPreference(
  input: CheckoutPreferenceInput,
): Promise<CheckoutPreferenceResult> {
  const response = await fetch("/api/proxy/pagos/checkout-pro/preference", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as {
    data?: CheckoutPreferenceResult;
  };

  if (!payload.data?.checkoutUrl) {
    throw new Error("Mercado Pago no devolvio una URL de checkout valida");
  }

  return payload.data;
}

export async function fetchPublicCheckoutStatus(
  compraId: string,
): Promise<PublicCheckoutStatus> {
  const response = await fetch(`/api/proxy/pagos/public/${compraId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as {
    data?: PublicCheckoutStatus;
  };

  if (!payload.data) {
    throw new Error("Respuesta invalida del estado de checkout");
  }

  return payload.data;
}
