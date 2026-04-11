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
import type { Purchase } from "@/data/purchases";
import {
  fetchAdminEvents,
  fetchPublicEvents,
} from "@/lib/events-api";
import { fetchAdminPurchases } from "@/lib/managed-purchases-api";
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
  purchases: Purchase[];
  categories: string[];
  carouselEventIds: string[];
  toast: AdminToast | null;
  isEventsLoading: boolean;
  isPurchasesLoading: boolean;
  isCategoriesLoading: boolean;
  isCarouselLoading: boolean;
  addEvent: (event: Event | Omit<Event, "id">) => void;
  updateEvent: (id: string, updates: Partial<Event> | Event) => void;
  deleteEvent: (id: string) => void;
  addCategory: (category: string) => Promise<boolean>;
  renameCategory: (
    currentCategory: string,
    nextCategory: string,
  ) => Promise<boolean>;
  removeCategory: (category: string) => Promise<boolean>;
  setCarouselEventIds: (ids: string[]) => void;
  showToast: (message: string, type: AdminToastType) => void;
  clearToast: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const PUBLIC_EVENTS_QUERY_KEY = ["public-events"] as const;
const ADMIN_EVENTS_QUERY_KEY = ["admin-events"] as const;
const ADMIN_PURCHASES_QUERY_KEY = ["admin-purchases"] as const;
const PUBLIC_CATEGORIES_QUERY_KEY = ["public-categories"] as const;
const CAROUSEL_EVENTS_QUERY_KEY = ["carousel-events"] as const;

function normalizeCategory(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isEventPubliclyVisible(event: Event): boolean {
  return event.status !== "CANCELADO" && event.visibleInApp !== false;
}

function upsertEventList(events: Event[], nextEvent: Event): Event[] {
  const withoutCurrent = events.filter((event) => event.id !== nextEvent.id);
  return [nextEvent, ...withoutCurrent];
}

function syncPublicEvents(events: Event[], nextEvent: Event): Event[] {
  const withoutCurrent = events.filter((event) => event.id !== nextEvent.id);
  if (!isEventPubliclyVisible(nextEvent)) {
    return withoutCurrent;
  }
  return [nextEvent, ...withoutCurrent];
}

function sanitizeCarouselIds(ids: string[], events: Event[]): string[] {
  const validEventIds = new Set(
    events
      .filter((event) => event.visibleInApp !== false)
      .map((event) => event.id),
  );
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
  const [toast, setToast] = useState<AdminToast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdminRoute = pathname.startsWith("/admin");
  const shouldFetchPublicCatalog =
    pathname === "/" || pathname === "/cartelera" || pathname === "/explorar";
  const shouldFetchCatalogData = shouldFetchPublicCatalog || isAdminRoute;

  const { data: publicEvents = [], isLoading: isPublicEventsLoading } = useQuery({
    queryKey: PUBLIC_EVENTS_QUERY_KEY,
    queryFn: fetchPublicEvents,
    enabled: shouldFetchPublicCatalog,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { data: adminEvents = [], isLoading: isAdminEventsLoading } = useQuery({
    queryKey: ADMIN_EVENTS_QUERY_KEY,
    queryFn: fetchAdminEvents,
    enabled: isAdminRoute,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: purchases = [], isLoading: isPurchasesLoading } = useQuery({
    queryKey: ADMIN_PURCHASES_QUERY_KEY,
    queryFn: fetchAdminPurchases,
    enabled: isAdminRoute,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: categoryRecords = [], isLoading: isCategoriesLoading } =
    useQuery({
      queryKey: PUBLIC_CATEGORIES_QUERY_KEY,
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

  const { data: fetchedCarouselEventIds = [], isLoading: isCarouselLoading } =
    useQuery({
      queryKey: CAROUSEL_EVENTS_QUERY_KEY,
      queryFn: fetchCarouselEventIds,
      enabled: pathname === "/" || isAdminRoute,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });

  const events = isAdminRoute ? adminEvents : publicEvents;
  const categories = useMemo(
    () => categoryRecords.map((category) => category.nombre),
    [categoryRecords],
  );
  const carouselEventIds = useMemo(
    () => sanitizeCarouselIds(fetchedCarouselEventIds, events),
    [events, fetchedCarouselEventIds],
  );

  const isEventsLoading =
    (isAdminRoute ? isAdminEventsLoading : isPublicEventsLoading) &&
    events.length === 0;

  const applyEventToCaches = useCallback(
    (nextEvent: Event) => {
      queryClient.setQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY, (prev = []) =>
        upsertEventList(prev, nextEvent),
      );
      queryClient.setQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY, (prev = []) =>
        syncPublicEvents(prev, nextEvent),
      );

      if (!isEventPubliclyVisible(nextEvent)) {
        queryClient.setQueryData<string[]>(CAROUSEL_EVENTS_QUERY_KEY, (prev = []) =>
          prev.filter((eventId) => eventId !== nextEvent.id),
        );
      }
    },
    [queryClient],
  );

  const addEvent = useCallback(
    (event: Event | Omit<Event, "id">) => {
      if (!("id" in event)) return;
      applyEventToCaches(event);
    },
    [applyEventToCaches],
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<Event> | Event) => {
      const currentEvent =
        (queryClient.getQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY) || []).find(
          (event) => event.id === id,
        ) ||
        (queryClient.getQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY) || []).find(
          (event) => event.id === id,
        );

      if (!currentEvent) return;

      applyEventToCaches({ ...currentEvent, ...updates, id });
    },
    [applyEventToCaches, queryClient],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      queryClient.setQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY, (prev = []) =>
        prev.filter((event) => event.id !== id),
      );
      queryClient.setQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY, (prev = []) =>
        prev.filter((event) => event.id !== id),
      );
      queryClient.setQueryData<string[]>(CAROUSEL_EVENTS_QUERY_KEY, (prev = []) =>
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
          PUBLIC_CATEGORIES_QUERY_KEY,
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
          PUBLIC_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            prev.map((category) =>
              category.id === currentRecord.id ? normalizedUpdated : category,
            ),
        );

        const syncCategoryInEvents = (items: Event[]) =>
          items.map((event) =>
            event.category.toLowerCase() === normalizedCurrent.toLowerCase()
              ? { ...event, category: normalizedUpdated.nombre }
              : event,
          );

        queryClient.setQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY, (prev = []) =>
          syncCategoryInEvents(prev),
        );
        queryClient.setQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY, (prev = []) =>
          syncCategoryInEvents(prev),
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
          PUBLIC_CATEGORIES_QUERY_KEY,
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
        CAROUSEL_EVENTS_QUERY_KEY,
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
      purchases,
      categories,
      carouselEventIds,
      toast,
      isEventsLoading,
      isPurchasesLoading,
      isCategoriesLoading:
        shouldFetchCatalogData && isCategoriesLoading && categoryRecords.length === 0,
      isCarouselLoading:
        (pathname === "/" || isAdminRoute) &&
        isCarouselLoading &&
        fetchedCarouselEventIds.length === 0,
      addEvent,
      updateEvent,
      deleteEvent,
      addCategory,
      renameCategory,
      removeCategory,
      setCarouselEventIds,
      showToast,
      clearToast,
    }),
    [
      addCategory,
      addEvent,
      carouselEventIds,
      categories,
      categoryRecords.length,
      clearToast,
      deleteEvent,
      events,
      fetchedCarouselEventIds.length,
      isAdminRoute,
      isCarouselLoading,
      isCategoriesLoading,
      isEventsLoading,
      isPurchasesLoading,
      pathname,
      purchases,
      removeCategory,
      renameCategory,
      setCarouselEventIds,
      shouldFetchCatalogData,
      showToast,
      toast,
      updateEvent,
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
