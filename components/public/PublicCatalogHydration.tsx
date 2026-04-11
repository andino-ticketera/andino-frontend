import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  CAROUSEL_EVENTS_QUERY_KEY,
  PUBLIC_CATEGORIES_QUERY_KEY,
  PUBLIC_EVENTS_QUERY_KEY,
} from "@/lib/query-keys";
import {
  fetchCarouselEventIdsServer,
  fetchPublicCategoriesServer,
  fetchPublicEventsServer,
} from "@/lib/public-catalog-server";

interface PublicCatalogHydrationProps {
  children: ReactNode;
  includeCarousel?: boolean;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}

export default async function PublicCatalogHydration({
  children,
  includeCarousel = false,
}: PublicCatalogHydrationProps) {
  const queryClient = createQueryClient();

  const tasks = [
    queryClient.prefetchQuery({
      queryKey: PUBLIC_EVENTS_QUERY_KEY,
      queryFn: fetchPublicEventsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: PUBLIC_CATEGORIES_QUERY_KEY,
      queryFn: fetchPublicCategoriesServer,
    }),
  ];

  if (includeCarousel) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: CAROUSEL_EVENTS_QUERY_KEY,
        queryFn: fetchCarouselEventIdsServer,
      }),
    );
  }

  await Promise.allSettled(tasks);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
