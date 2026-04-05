import { AUTH_SESSION_STORAGE_KEY } from "@/lib/auth-constants";

export type UserRole = "USUARIO" | "ADMIN" | "ORGANIZADOR";

export interface AuthUser {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  loggedAt: string;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

export function readAuthSession(): AuthSession | null {
  if (!canUseBrowserStorage()) return null;

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed || !parsed.user || typeof parsed.user.rol !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession): void {
  if (!canUseBrowserStorage()) return;

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function clearAuthSession(): void {
  if (canUseBrowserStorage()) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }
}

export function getAuthRole(): UserRole | null {
  const session = readAuthSession();
  return session?.user.rol || null;
}

export function getRedirectByRole(role: UserRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "ORGANIZADOR") return "/organizador/dashboard";
  return "/usuario/compras";
}
