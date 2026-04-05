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
import { purchases as initialPurchases, type Purchase } from "@/data/purchases";
import type { Organizer } from "@/data/organizers";
import {
  createEventFromOrganizer,
  fetchOrganizerEvents,
  updateEventFromOrganizer,
} from "@/lib/events-api";
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
  isEventsLoading: boolean;
  purchases: Purchase[];
  toast: OrganizerToast | null;
  addEvent: (event: Omit<Event, "id">) => Promise<Event>;
  updateEvent: (id: string, event: Omit<Event, "id">) => Promise<Event>;
  toggleCheckedIn: (purchaseId: string) => void;
  showToast: (message: string, type: OrganizerToastType) => void;
  clearToast: () => void;
}

const OrganizerContext = createContext<OrganizerContextValue | undefined>(
  undefined,
);

function buildOrganizerFromSession(): Organizer {
  const session = readAuthSession();
  const nombreCompleto = session?.user.nombreCompleto?.trim() || "Organizador";
  const partes = nombreCompleto.split(/\s+/).filter(Boolean);
  const nombre = partes[0] || "Organizador";
  const apellido = partes.slice(1).join(" ");

  return {
    id: session?.user.id || "organizador-sin-sesion",
    nombre,
    apellido,
    empresa: nombreCompleto,
    email: session?.user.email || "sin-email@example.com",
    telefono: "",
  };
}

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [allPurchases, setAllPurchases] =
    useState<Purchase[]>(initialPurchases);
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
    queryKey: ["organizer-events", session?.user.id],
    queryFn: fetchOrganizerEvents,
    enabled:
      session?.user.rol === "ORGANIZADOR" || session?.user.rol === "ADMIN",
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const eventIds = useMemo(() => new Set(events.map((e) => e.id)), [events]);

  const purchases = useMemo(
    () => allPurchases.filter((p) => eventIds.has(p.eventId)),
    [allPurchases, eventIds],
  );

  const addEvent = useCallback(
    async (event: Omit<Event, "id">) => {
      const createdEvent = await createEventFromOrganizer(event);

      queryClient.setQueryData<Event[]>(
        ["organizer-events", session?.user.id],
        (current = []) => [createdEvent, ...current],
      );
      queryClient.setQueryData<Event[]>(["public-events"], (current = []) => [
        ...current,
        createdEvent,
      ]);

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
        ["organizer-events", session?.user.id],
        (current = []) =>
          current.map((item) =>
            item.id === updatedEvent.id ? updatedEvent : item,
          ),
      );
      queryClient.setQueryData<Event[]>(["public-events"], (current = []) =>
        current.map((item) =>
          item.id === updatedEvent.id ? updatedEvent : item,
        ),
      );

      return updatedEvent;
    },
    [queryClient, session?.user.id],
  );

  const toggleCheckedIn = useCallback((purchaseId: string) => {
    setAllPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, checkedIn: !p.checkedIn } : p,
      ),
    );
  }, []);

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
      isEventsLoading,
      purchases,
      toast,
      addEvent,
      updateEvent,
      toggleCheckedIn,
      showToast,
      clearToast,
    }),
    [
      organizer,
      events,
      isEventsLoading,
      purchases,
      toast,
      addEvent,
      updateEvent,
      toggleCheckedIn,
      showToast,
      clearToast,
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
