import type { AuthUser } from "@/lib/auth-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface ApiErrorShape {
  mensaje?: string;
  error?: string;
}

interface AuthApiResponse {
  user: AuthUser;
  requiresEmailVerification?: boolean;
}

interface SyncTokenResponse {
  user: AuthUser;
}

function getAuthBaseEndpoint(): string {
  return "/api/session";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorShape;
    if (payload?.mensaje && payload.mensaje.trim()) return payload.mensaje;
    if (payload?.error && payload.error.trim()) return payload.error;
  } catch {
    // Ignore parsing errors and fallback to generic message.
  }

  return `Error de autenticacion (${response.status})`;
}

async function parseAuthResponse(response: Response): Promise<AuthApiResponse> {
  const payload = (await response.json()) as AuthApiResponse;

  if (!payload?.user?.rol) {
    throw new Error("Respuesta de autenticacion invalida");
  }

  return payload;
}

function parseSessionResponse(payload: AuthApiResponse): AuthApiResponse {
  if (!payload?.user?.rol) {
    throw new Error("Respuesta de autenticacion invalida");
  }

  return payload;
}

export async function registerAuth(input: {
  nombreCompleto: string;
  email: string;
  password: string;
}): Promise<AuthApiResponse> {
  const response = await fetch(`${getAuthBaseEndpoint()}/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre_completo: input.nombreCompleto,
      email: input.email,
      password: input.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseAuthResponse(response);
  return parseSessionResponse(payload);
}

export async function loginAuth(input: {
  email: string;
  password: string;
}): Promise<AuthApiResponse> {
  const response = await fetch(`${getAuthBaseEndpoint()}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await parseAuthResponse(response);
  return parseSessionResponse(payload);
}

export async function logoutAuth(): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  } catch {
    // Best effort cleanup on browser session.
  }

  await fetch(`${getAuthBaseEndpoint()}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
}

export async function requestPasswordResetAuth(email: string): Promise<void> {
  const response = await fetch(`${getAuthBaseEndpoint()}/forgot-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function startGoogleOAuthAuth(input?: {
  redirectTo?: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const redirectTo =
    input?.redirectTo || `${window.location.origin}/iniciar-sesion`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo iniciar sesión con Google");
  }

  if (data.url) {
    window.location.assign(data.url);
  }
}

export async function hydrateSupabaseSessionAuth(): Promise<AuthApiResponse | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "No se pudo leer la sesión de Supabase");
  }

  const token = data.session?.access_token;
  if (!token) return null;

  const syncResponse = await fetch(`${getAuthBaseEndpoint()}/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!syncResponse.ok) {
    throw new Error(await parseErrorMessage(syncResponse));
  }

  const syncPayload = (await syncResponse.json()) as SyncTokenResponse;

  if (!syncPayload?.user?.rol) {
    throw new Error("Respuesta de autenticacion invalida");
  }

  return {
    user: syncPayload.user,
  };
}

export async function updatePasswordAuth(password: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(error.message || "No se pudo actualizar la clave");
  }

  await hydrateSupabaseSessionAuth();
}
