import { readAuthSession } from "@/lib/auth-client";

export interface BuyerProfile {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipoDocumento: string;
}

const BUYER_PROFILE_STORAGE_KEY = "andino-buyer-profile";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

function getBuyerProfileStorageKey(): string | null {
  const session = readAuthSession();
  if (!session?.user?.id) {
    return null;
  }

  return `${BUYER_PROFILE_STORAGE_KEY}:${session.user.id}`;
}

export function readStoredBuyerProfile(): BuyerProfile | null {
  if (!canUseBrowserStorage()) return null;

  const storageKey = getBuyerProfileStorageKey();
  if (!storageKey) return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BuyerProfile;

    if (!parsed || typeof parsed.email !== "string") {
      return null;
    }

    return {
      nombre: parsed.nombre || "",
      apellido: parsed.apellido || "",
      email: parsed.email || "",
      documento: parsed.documento || "",
      tipoDocumento: parsed.tipoDocumento || "DNI",
    };
  } catch {
    return null;
  }
}

export function writeStoredBuyerProfile(profile: BuyerProfile): void {
  if (!canUseBrowserStorage()) return;

  const storageKey = getBuyerProfileStorageKey();
  if (!storageKey) return;

  window.localStorage.setItem(storageKey, JSON.stringify(profile));
}
