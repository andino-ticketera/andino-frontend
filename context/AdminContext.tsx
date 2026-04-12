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
  fetchAdminCategories,
  deleteCategory,
  fetchPublicCategories,
  updateCategory,
  updateCategoryVisibility,
} from "@/lib/categories-api";
import {
  ADMIN_CATEGORIES_QUERY_KEY,
  ADMIN_EVENTS_QUERY_KEY,
  ADMIN_PURCHASES_QUERY_KEY,
  CAROUSEL_EVENTS_QUERY_KEY,
  PUBLIC_CATEGORIES_QUERY_KEY,
  PUBLIC_EVENTS_QUERY_KEY,
} from "@/lib/query-keys";

export type AdminToastType = "success" | "danger";

export interface AdminToast {
  message: string;
  type: AdminToastType;
}

interface AdminContextValue {
  events: Event[];
  purchases: Purchase[];
  categories: string[];
  allCategories: BackendCategoria[];
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
  setCategoryVisibility: (
    category: string,
    visibleInApp: boolean,
  ) => Promise<boolean>;
  setCarouselEventIds: (ids: string[]) => void;
  showToast: (message: string, type: AdminToastType) => void;
  clearToast: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

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
      visible_en_app: category.visible_en_app !== false,
    }))
    .filter((category, index, arr) => {
      if (!category.nombre) return false;
      return (
        arr.findIndex(
          (value) =>
            value.id === category.id ||
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

  const { data: publicCategoryRecords = [], isLoading: isPublicCategoriesLoading } =
    useQuery({
      queryKey: PUBLIC_CATEGORIES_QUERY_KEY,
      queryFn: fetchPublicCategories,
      select: normalizeCategories,
      enabled: shouldFetchPublicCatalog,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });

  const { data: adminCategoryRecords = [], isLoading: isAdminCategoriesLoading } =
    useQuery({
      queryKey: ADMIN_CATEGORIES_QUERY_KEY,
      queryFn: fetchAdminCategories,
      select: normalizeCategories,
      enabled: isAdminRoute,
      staleTime: 0,
      refetchOnWindowFocus: false,
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
  const allCategories = isAdminRoute ? adminCategoryRecords : publicCategoryRecords;
  const categories = useMemo(
    () =>
      allCategories
        .filter((category) => category.visible_en_app !== false)
        .map((category) => category.nombre),
    [allCategories],
  );
  const carouselEventIds = useMemo(
    () => sanitizeCarouselIds(fetchedCarouselEventIds, events),
    [events, fetchedCarouselEventIds],
  );

  const isEventsLoading =
    (isAdminRoute ? isAdminEventsLoading : isPublicEventsLoading) &&
    events.length === 0;
  const isCategoriesLoading =
    (isAdminRoute ? isAdminCategoriesLoading : isPublicCategoriesLoading) &&
    allCategories.length === 0;

  const isCategoryPubliclyVisible = useCallback(
    (categoryName: string) => {
      const normalizedCategory = categoryName.trim().toLowerCase();
      if (!normalizedCategory) return true;

      const knownCategories =
        queryClient.getQueryData<BackendCategoria[]>(ADMIN_CATEGORIES_QUERY_KEY) ||
        queryClient.getQueryData<BackendCategoria[]>(PUBLIC_CATEGORIES_QUERY_KEY) ||
        [];

      const match = knownCategories.find(
        (category) => category.nombre.toLowerCase() === normalizedCategory,
      );

      return match ? match.visible_en_app !== false : true;
    },
    [queryClient],
  );

  const applyEventToCaches = useCallback(
    (nextEvent: Event) => {
      const categoryVisible = isCategoryPubliclyVisible(nextEvent.category);

      queryClient.setQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY, (prev = []) =>
        upsertEventList(prev, nextEvent),
      );
      setQueryDataIfPresent<Event[]>(
        queryClient,
        PUBLIC_EVENTS_QUERY_KEY,
        (prev) => {
          const withoutCurrent = prev.filter(
            (event) => event.id !== nextEvent.id,
          );
          if (!isEventPubliclyVisible(nextEvent) || !categoryVisible) {
            return withoutCurrent;
          }
          return [nextEvent, ...withoutCurrent];
        },
      );

      if (!isEventPubliclyVisible(nextEvent) || !categoryVisible) {
        setQueryDataIfPresent<string[]>(
          queryClient,
          CAROUSEL_EVENTS_QUERY_KEY,
          (prev) => prev.filter((eventId) => eventId !== nextEvent.id),
        );
      }
    },
    [isCategoryPubliclyVisible, queryClient],
  );

  const addEvent = useCallback(
    (event: Event | Omit<Event, "id">) => {
      if (!("id" in event)) return;
      applyEventToCaches(event);
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CAROUSEL_EVENTS_QUERY_KEY });
    },
    [applyEventToCaches, queryClient],
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
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CAROUSEL_EVENTS_QUERY_KEY });
    },
    [applyEventToCaches, queryClient],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      queryClient.setQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY, (prev = []) =>
        prev.filter((event) => event.id !== id),
      );
      setQueryDataIfPresent<Event[]>(queryClient, PUBLIC_EVENTS_QUERY_KEY, (prev) =>
        prev.filter((event) => event.id !== id),
      );
      setQueryDataIfPresent<string[]>(
        queryClient,
        CAROUSEL_EVENTS_QUERY_KEY,
        (prev) => prev.filter((eventId) => eventId !== id),
      );
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CAROUSEL_EVENTS_QUERY_KEY });
    },
    [queryClient],
  );

  const addCategory = useCallback(
    async (category: string) => {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) return false;

      const alreadyExists = allCategories.some(
        (existingCategory) =>
          existingCategory.nombre.toLowerCase() ===
          normalizedCategory.toLowerCase(),
      );
      if (alreadyExists) return false;

      try {
        const created = await createCategory(normalizedCategory);
        queryClient.setQueryData<BackendCategoria[]>(
          ADMIN_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            normalizeCategories([
              ...prev,
              { ...created, nombre: normalizeCategory(created.nombre) },
            ]),
        );
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
    [allCategories, queryClient],
  );

  const renameCategory = useCallback(
    async (currentCategory: string, nextCategory: string) => {
      const normalizedCurrent = normalizeCategory(currentCategory);
      const normalizedNext = normalizeCategory(nextCategory);

      if (!normalizedCurrent || !normalizedNext) return false;

      const currentRecord = allCategories.find(
        (category) =>
          category.nombre.toLowerCase() === normalizedCurrent.toLowerCase(),
      );
      if (!currentRecord) return false;

      const alreadyExists = allCategories.some(
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
          visible_en_app: updated.visible_en_app !== false,
        };

        queryClient.setQueryData<BackendCategoria[]>(
          ADMIN_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            prev.map((category) =>
              category.id === currentRecord.id ? normalizedUpdated : category,
            ),
        );
        queryClient.setQueryData<BackendCategoria[]>(
          PUBLIC_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            normalizeCategories(
              prev.map((category) =>
                category.id === currentRecord.id ? normalizedUpdated : category,
              ),
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
    [allCategories, queryClient],
  );

  const removeCategory = useCallback(
    async (category: string) => {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) return false;

      const categoryRecord = allCategories.find(
        (existingCategory) =>
          existingCategory.nombre.toLowerCase() ===
          normalizedCategory.toLowerCase(),
      );
      if (!categoryRecord) return false;

      try {
        await deleteCategory(categoryRecord.id);
        queryClient.setQueryData<BackendCategoria[]>(
          ADMIN_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            prev.filter(
              (existingCategory) => existingCategory.id !== categoryRecord.id,
            ),
        );
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
    [allCategories, queryClient],
  );

  const setCategoryVisibility = useCallback(
    async (category: string, visibleInApp: boolean) => {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) return false;

      const categoryRecord = allCategories.find(
        (existingCategory) =>
          existingCategory.nombre.toLowerCase() ===
          normalizedCategory.toLowerCase(),
      );
      if (!categoryRecord) return false;

      try {
        const updated = await updateCategoryVisibility(
          categoryRecord.id,
          visibleInApp,
        );
        const normalizedUpdated = {
          ...updated,
          nombre: normalizeCategory(updated.nombre),
          visible_en_app: updated.visible_en_app !== false,
        };

        queryClient.setQueryData<BackendCategoria[]>(
          ADMIN_CATEGORIES_QUERY_KEY,
          (prev = []) =>
            normalizeCategories(
              prev.map((existingCategory) =>
                existingCategory.id === categoryRecord.id
                  ? normalizedUpdated
                  : existingCategory,
              ),
            ),
        );
        queryClient.setQueryData<BackendCategoria[]>(
          PUBLIC_CATEGORIES_QUERY_KEY,
          (prev = []) => {
            const nextVisibleCategories = prev.filter(
              (existingCategory) => existingCategory.id !== categoryRecord.id,
            );

            if (!normalizedUpdated.visible_en_app) {
              return normalizeCategories(nextVisibleCategories);
            }

            return normalizeCategories([
              ...nextVisibleCategories,
              normalizedUpdated,
            ]);
          },
        );

        const matchesCategory = (event: Event) =>
          event.category.toLowerCase() === normalizedCategory.toLowerCase();

        if (!normalizedUpdated.visible_en_app) {
          queryClient.setQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY, (prev = []) =>
            prev.filter((event) => !matchesCategory(event)),
          );
          queryClient.setQueryData<string[]>(CAROUSEL_EVENTS_QUERY_KEY, (prev = []) => {
            const adminEventsCache =
              queryClient.getQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY) || [];
            const hiddenEventIds = new Set(
              adminEventsCache
                .filter((event) => matchesCategory(event))
                .map((event) => event.id),
            );
            return prev.filter((eventId) => !hiddenEventIds.has(eventId));
          });
          return true;
        }

        const adminEventsCache =
          queryClient.getQueryData<Event[]>(ADMIN_EVENTS_QUERY_KEY) || [];
        const visibleEventsToRestore = adminEventsCache.filter(
          (event) => matchesCategory(event) && isEventPubliclyVisible(event),
        );

        if (visibleEventsToRestore.length > 0) {
          queryClient.setQueryData<Event[]>(PUBLIC_EVENTS_QUERY_KEY, (prev = []) => {
            const merged = [...prev];

            for (const event of visibleEventsToRestore) {
              const existingIndex = merged.findIndex(
                (existingEvent) => existingEvent.id === event.id,
              );
              if (existingIndex >= 0) {
                merged[existingIndex] = event;
              } else {
                merged.unshift(event);
              }
            }

            return merged;
          });
        }

        return true;
      } catch {
        return false;
      }
    },
    [allCategories, queryClient],
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
      allCategories,
      carouselEventIds,
      toast,
      isEventsLoading,
      isPurchasesLoading,
      isCategoriesLoading,
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
      setCategoryVisibility,
      setCarouselEventIds,
      showToast,
      clearToast,
    }),
    [
      addCategory,
      addEvent,
      carouselEventIds,
      categories,
      allCategories,
      clearToast,
      deleteEvent,
      events,
      fetchedCarouselEventIds.length,
      isAdminRoute,
      isCarouselLoading,
      isEventsLoading,
      isCategoriesLoading,
      isPurchasesLoading,
      pathname,
      purchases,
      removeCategory,
      renameCategory,
      setCategoryVisibility,
      setCarouselEventIds,
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
