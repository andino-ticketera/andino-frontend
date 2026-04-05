export type AdminManagedUserRole = "USUARIO" | "ORGANIZADOR" | "ADMIN";

export interface AdminManagedUser {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: AdminManagedUserRole;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmado: boolean;
}

interface AdminUsersResponse {
  data?: AdminManagedUser[];
}

interface AdminUserResponse {
  user?: AdminManagedUser;
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
    // Ignore parse error and fallback below.
  }

  return `No se pudo completar la operacion (${response.status})`;
}

export async function fetchAdminUsers(): Promise<AdminManagedUser[]> {
  const response = await fetch("/api/proxy/auth/users", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as AdminUsersResponse;
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function updateAdminUserRole(
  userId: string,
  role: Extract<AdminManagedUserRole, "USUARIO" | "ORGANIZADOR">,
): Promise<AdminManagedUser> {
  const response = await fetch(`/api/proxy/auth/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as AdminUserResponse;

  if (!payload.user?.id || !payload.user.rol) {
    throw new Error("Respuesta invalida al actualizar el rol");
  }

  return payload.user;
}
