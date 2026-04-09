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
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Event } from "@/data/events";
import { purchases as initialPurchases, type Purchase } from "@/data/purchases";
import { fetchPublicEvents } from "@/lib/events-api";
import { fetchCarouselEventIds } from "@/lib/carousel-api";
import {
  type BackendCategoria,
  createCategory,
  deleteCategory,
  fetchPublicCategories,
  updateCategory,
} from "@/lib/categories-api";

export type AdminToastType = "success" | "danger";

export interface AdminToast {
  message: string;
  type: AdminToastType;
}

interface AdminContextValue {
  events: Event[];
  isEventsLoading: boolean;
  isCategoriesLoading: boolean;
  isCarouselLoading: boolean;
  purchases: Purchase[];
  categories: string[];
  carouselEventIds: string[];
  toast: AdminToast | null;
  addEvent: (event: Event | Omit<Event, "id">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addCategory: (category: string) => Promise<boolean>;
  renameCategory: (
    currentCategory: string,
    nextCategory: string,
  ) => Promise<boolean>;
  removeCategory: (category: string) => Promise<boolean>;
  setCarouselEventIds: (ids: string[]) => void;
  addPurchase: (purchase: Omit<Purchase, "id">) => void;
  showToast: (message: string, type: AdminToastType) => void;
  clearToast: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function normalizeCategory(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function sanitizeCarouselIds(ids: string[], events: Event[]): string[] {
  const validEventIds = new Set(events.map((event) => event.id));
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const rawId of ids) {
    const id = String(rawId || "").trim();
    if (!id || !validEventIds.has(id) || seen.has(id)) continue;
    sanitized.push(id);
    seen.add(id);
    if (sanitized.length === 6) break;
  }

  return sanitized;
}

function normalizeCategories(
  fetchedCategories: BackendCategoria[],
): BackendCategoria[] {
  return fetchedCategories
    .map((category) => ({
      ...category,
      nombre: normalizeCategory(category.nombre),
    }))
    .filter((category, index, arr) => {
      if (!category.nombre) return false;
      return (
        arr.findIndex(
          (value) =>
            value.nombre.toLowerCase() === category.nombre.toLowerCase(),
        ) === index
      );
    });
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const shouldFetchCatalogData =
    pathname === "/" ||
    pathname === "/cartelera" ||
    pathname === "/explorar" ||
    pathname.startsWith("/admin");

  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [toast, setToast] = useState<AdminToast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: fetchedEvents = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: fetchPublicEvents,
    enabled: shouldFetchCatalogData,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { data: categoryRecords = [], isLoading: isCatLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchPublicCategories,
    select: normalizeCategories,
    enabled: shouldFetchCatalogData,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { data: fetchedCarouselEventIds = [], isLoading: isCarouselLoading } = useQuery({
    queryKey: ["carousel-events"],
    queryFn: fetchCarouselEventIds,
    enabled: shouldFetchCatalogData,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const events = fetchedEvents;

  const categories = useMemo(
    () => categoryRecords.map((category) => category.nombre),
    [categoryRecords],
  );

  const carouselEventIds = useMemo(
    () => sanitizeCarouselIds(fetchedCarouselEventIds, events),
    [fetchedCarouselEventIds, events],
  );

  const isEventsLoading =
    shouldFetchCatalogData && isLoading && events.length === 0;

  const isCategoriesLoading =
    shouldFetchCatalogData && isCatLoading && categoryRecords.length === 0;

  const isCarouselLoadingState =
    shouldFetchCatalogData && isCarouselLoading && fetchedCarouselEventIds.length === 0;

  const addEvent = useCallback(
    (event: Event | Omit<Event, "id">) => {
      const createdEvent =
        "id" in event ? event : { ...event, id: generateId("ev") };

      queryClient.setQueryData<Event[]>(["public-events"], (prev = []) => [
        ...prev,
        createdEvent,
      ]);
    },
    [queryClient],
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<Event>) => {
      queryClient.setQueryData<Event[]>(["public-events"], (prev = []) =>
        prev.map((event) =>
          event.id === id ? { ...event, ...updates } : event,
        ),
      );
    },
    [queryClient],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      queryClient.setQueryData<Event[]>(["public-events"], (prev = []) =>
        prev.filter((event) => event.id !== id),
      );

      queryClient.setQueryData<string[]>(["carousel-events"], (prev = []) =>
        prev.filter((eventId) => eventId !== id),
      );
    },
    [queryClient],
  );

  const addCategory = useCallback(
    async (category: string) => {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) return false;

      const alreadyExists = categoryRecords.some(
        (existingCategory) =>
          existingCategory.nombre.toLowerCase() ===
          normalizedCategory.toLowerCase(),
      );
      if (alreadyExists) return false;

      try {
        const created = await createCategory(normalizedCategory);
        queryClient.setQueryData<BackendCategoria[]>(
          ["public-categories"],
          (prev = []) =>
            normalizeCategories([
              ...prev,
              { ...created, nombre: normalizeCategory(created.nombre) },
            ]),
        );
        return true;
      } catch {
        return false;
      }
    },
    [categoryRecords, queryClient],
  );

  const renameCategory = useCallback(
    async (currentCategory: string, nextCategory: string) => {
      const normalizedCurrent = normalizeCategory(currentCategory);
      const normalizedNext = normalizeCategory(nextCategory);

      if (!normalizedCurrent || !normalizedNext) return false;

      const currentRecord = categoryRecords.find(
        (category) =>
          category.nombre.toLowerCase() === normalizedCurrent.toLowerCase(),
      );
      if (!currentRecord) return false;

      const alreadyExists = categoryRecords.some(
        (category) =>
          category.id !== currentRecord.id &&
          category.nombre.toLowerCase() === normalizedNext.toLowerCase(),
      );
      if (alreadyExists) return false;

      try {
        const updated = await updateCategory(currentRecord.id, normalizedNext);
        const normalizedUpdated = {
          ...updated,
          nombre: normalizeCategory(updated.nombre),
        };

        queryClient.setQueryData<BackendCategoria[]>(
          ["public-categories"],
          (prev = []) =>
            prev.map((category) =>
              category.id === currentRecord.id ? normalizedUpdated : category,
            ),
        );

        queryClient.setQueryData<Event[]>(["public-events"], (prev = []) =>
          prev.map((event) =>
            event.category.toLowerCase() === normalizedCurrent.toLowerCase()
              ? { ...event, category: normalizedUpdated.nombre }
              : event,
          ),
        );

        return true;
      } catch {
        return false;
      }
    },
    [categoryRecords, queryClient],
  );

  const removeCategory = useCallback(
    async (category: string) => {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) return false;

      const categoryRecord = categoryRecords.find(
        (existingCategory) =>
          existingCategory.nombre.toLowerCase() ===
          normalizedCategory.toLowerCase(),
      );
      if (!categoryRecord) return false;

      try {
        await deleteCategory(categoryRecord.id);
        queryClient.setQueryData<BackendCategoria[]>(
          ["public-categories"],
          (prev = []) =>
            prev.filter(
              (existingCategory) => existingCategory.id !== categoryRecord.id,
            ),
        );
        return true;
      } catch {
        return false;
      }
    },
    [categoryRecords, queryClient],
  );

  const setCarouselEventIds = useCallback(
    (ids: string[]) => {
      queryClient.setQueryData<string[]>(
        ["carousel-events"],
        sanitizeCarouselIds(ids, events),
      );
    },
    [events, queryClient],
  );

  const clearToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: AdminToastType) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  }, []);

  const addPurchase = useCallback(
    (purchase: Omit<Purchase, "id">) => {
      const createdPurchase: Purchase = {
        ...purchase,
        id: generateId("purchase"),
      };

      setPurchases((prev) => [createdPurchase, ...prev]);

      queryClient.setQueryData<Event[]>(["public-events"], (prev = []) =>
        prev.map((event) => {
          if (event.id !== createdPurchase.eventId) return event;
          return {
            ...event,
            entradasVendidas: event.entradasVendidas + createdPurchase.quantity,
          };
        }),
      );
    },
    [queryClient],
  );

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      events,
      isEventsLoading,
      isCategoriesLoading,
      isCarouselLoading: isCarouselLoadingState,
      purchases,
      categories,
      carouselEventIds,
      toast,
      addEvent,
      updateEvent,
      deleteEvent,
      addCategory,
      renameCategory,
      removeCategory,
      setCarouselEventIds,
      addPurchase,
      showToast,
      clearToast,
    }),
    [
      events,
      isEventsLoading,
      isCategoriesLoading,
      isCarouselLoadingState,
      purchases,
      categories,
      carouselEventIds,
      toast,
      addEvent,
      updateEvent,
      deleteEvent,
      addCategory,
      renameCategory,
      removeCategory,
      setCarouselEventIds,
      addPurchase,
      showToast,
      clearToast,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
