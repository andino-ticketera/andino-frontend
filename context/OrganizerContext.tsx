"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Event } from "@/data/events";
import type { Purchase } from "@/data/purchases";
import type { Organizer } from "@/data/organizers";
import {
  createEventFromOrganizer,
  fetchOrganizerEvents,
  updateEventFromOrganizer,
} from "@/lib/events-api";
import {
  fetchOrganizerPurchases,
  updateOrganizerPurchaseCheckIn,
} from "@/lib/managed-purchases-api";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/lib/auth-client";

export type OrganizerToastType = "success" | "danger";

export interface OrganizerToast {
  message: string;
  type: OrganizerToastType;
}

interface OrganizerContextValue {
  organizer: Organizer;
  events: Event[];
  purchases: Purchase[];
  toast: OrganizerToast | null;
  isEventsLoading: boolean;
  isPurchasesLoading: boolean;
  addEvent: (event: Omit<Event, "id">) => Promise<Event>;
  updateEvent: (id: string, event: Omit<Event, "id">) => Promise<Event>;
  toggleCheckedIn: (purchaseId: string, checkedIn: boolean) => Promise<void>;
  showToast: (message: string, type: OrganizerToastType) => void;
  clearToast: () => void;
}

const OrganizerContext = createContext<OrganizerContextValue | undefined>(
  undefined,
);

const ORGANIZER_EVENTS_QUERY_KEY = (userId?: string) =>
  ["organizer-events", userId] as const;
const ORGANIZER_PURCHASES_QUERY_KEY = (userId?: string) =>
  ["organizer-purchases", userId] as const;
const PUBLIC_EVENTS_QUERY_KEY = ["public-events"] as const;

function isEventPubliclyVisible(event: Event): boolean {
  return event.status !== "CANCELADO" && event.visibleInApp !== false;
}

function syncPublicEvents(events: Event[], nextEvent: Event): Event[] {
  const withoutCurrent = events.filter((event) => event.id !== nextEvent.id);
  if (!isEventPubliclyVisible(nextEvent)) {
    return withoutCurrent;
  }
  return [nextEvent, ...withoutCurrent];
}

function setQueryDataIfPresent<T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly unknown[],
  updater: (current: T) => T,
): void {
  const state = queryClient.getQueryState<T>(queryKey);
  if (state?.data === undefined) return;

  queryClient.setQueryData<T>(queryKey, (current) => {
    if (current === undefined) return current;
    return updater(current);
  });
}

function buildOrganizerFromSession(): Organizer {
  const session = readAuthSession();
  const nombreCompleto = session?.user.nombreCompleto?.trim() || "";
  const partes = nombreCompleto.split(/\s+/).filter(Boolean);
  const nombre = partes[0] || "";
  const apellido = partes.slice(1).join(" ");

  return {
    id: session?.user.id || "",
    nombre,
    apellido,
    empresa: nombreCompleto,
    email: session?.user.email || "",
    telefono: "",
  };
}

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<OrganizerToast | null>(null);
  const [session, setSession] = useState(() => readAuthSession());
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const syncSessionFromServer = async () => {
      try {
        const response = await fetch("/api/session/me", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401 && !cancelled) {
            clearAuthSession();
            setSession(null);
          }
          return;
        }

        const payload = (await response.json()) as {
          user?: {
            id: string;
            nombreCompleto: string;
            email: string;
            rol: "USUARIO" | "ORGANIZADOR" | "ADMIN";
          };
        };

        if (!payload.user || cancelled) return;

        const nextSession = {
          user: payload.user,
          loggedAt: new Date().toISOString(),
        };

        writeAuthSession(nextSession);
        setSession(nextSession);
      } catch {
        // Keep local fallback.
      }
    };

    void syncSessionFromServer();

    const onStorage = () => {
      setSession(readAuthSession());
    };

    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const organizer = buildOrganizerFromSession();

  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ORGANIZER_EVENTS_QUERY_KEY(session?.user.id),
    queryFn: fetchOrganizerEvents,
    enabled:
      session?.user.rol === "ORGANIZADOR" || session?.user.rol === "ADMIN",
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const { data: purchases = [], isLoading: isPurchasesLoading } = useQuery({
    queryKey: ORGANIZER_PURCHASES_QUERY_KEY(session?.user.id),
    queryFn: fetchOrganizerPurchases,
    enabled:
      session?.user.rol === "ORGANIZADOR" || session?.user.rol === "ADMIN",
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const addEvent = useCallback(
    async (event: Omit<Event, "id">) => {
      const createdEvent = await createEventFromOrganizer(event);

      queryClient.setQueryData<Event[]>(
        ORGANIZER_EVENTS_QUERY_KEY(session?.user.id),
        (current = []) => [createdEvent, ...current],
      );
      setQueryDataIfPresent<Event[]>(
        queryClient,
        PUBLIC_EVENTS_QUERY_KEY,
        (current) => syncPublicEvents(current, createdEvent),
      );
      void queryClient.invalidateQueries({
        queryKey: ORGANIZER_EVENTS_QUERY_KEY(session?.user.id),
      });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_EVENTS_QUERY_KEY });

      return createdEvent;
    },
    [queryClient, session?.user.id],
  );

  const updateEvent = useCallback(
    async (id: string, event: Omit<Event, "id">) => {
      const previousEvent = events.find((item) => item.id === id);
      const updatedEvent = await updateEventFromOrganizer(
        id,
        event,
        previousEvent,
      );

      queryClient.setQueryData<Event[]>(
        ORGANIZER_EVENTS_QUERY_KEY(session?.user.id),
        (current = []) =>
          current.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)),
      );
      setQueryDataIfPresent<Event[]>(
        queryClient,
        PUBLIC_EVENTS_QUERY_KEY,
        (current) => syncPublicEvents(current, updatedEvent),
      );
      void queryClient.invalidateQueries({
        queryKey: ORGANIZER_EVENTS_QUERY_KEY(session?.user.id),
      });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_EVENTS_QUERY_KEY });

      return updatedEvent;
    },
    [events, queryClient, session?.user.id],
  );

  const toggleCheckedIn = useCallback(
    async (purchaseId: string, checkedIn: boolean) => {
      const checkedInCount = await updateOrganizerPurchaseCheckIn(
        purchaseId,
        checkedIn,
      );

      queryClient.setQueryData<Purchase[]>(
        ORGANIZER_PURCHASES_QUERY_KEY(session?.user.id),
        (current = []) =>
          current.map((purchase) =>
            purchase.id === purchaseId
              ? { ...purchase, checkedInCount }
              : purchase,
          ),
      );
    },
    [queryClient, session?.user.id],
  );

  const clearToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: OrganizerToastType) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo<OrganizerContextValue>(
    () => ({
      organizer,
      events,
      purchases,
      toast,
      isEventsLoading,
      isPurchasesLoading,
      addEvent,
      updateEvent,
      toggleCheckedIn,
      showToast,
      clearToast,
    }),
    [
      addEvent,
      clearToast,
      events,
      isEventsLoading,
      isPurchasesLoading,
      organizer,
      purchases,
      showToast,
      toast,
      toggleCheckedIn,
      updateEvent,
    ],
  );

  return (
    <OrganizerContext.Provider value={value}>
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizer(): OrganizerContextValue {
  const context = useContext(OrganizerContext);
  if (!context) {
    throw new Error("useOrganizer must be used within an OrganizerProvider");
  }
  return context;
}
