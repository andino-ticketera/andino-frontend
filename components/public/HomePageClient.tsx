"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Event } from "@/data/events";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { EventGridSkeleton } from "@/components/EventSkeletons";
import EvaIcon from "@/components/EvaIcon";
import { useAdmin } from "@/context/AdminContext";

const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"));
const EventModal = dynamic(() => import("@/components/EventModal"), {
  ssr: false,
});

interface Filters {
  query: string;
  provincia: string;
  localidad: string;
  fecha: string;
}

function matchesFecha(eventDate: string, fecha: string): boolean {
  if (!fecha) return true;

  const months: Record<string, number> = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11,
  };
  const parts = eventDate.replace(",", "").split(" ");
  if (parts.length < 3) return true;
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return true;

  const eDate = new Date(year, month, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (eDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dayOfWeek = now.getDay();

  switch (fecha) {
    case "Hoy":
      return diffDays === 0;
    case "Esta semana": {
      const daysUntilSunday = 7 - dayOfWeek;
      return diffDays >= 0 && diffDays <= daysUntilSunday;
    }
    case "Este fin de semana": {
      const daysUntilSat = (6 - dayOfWeek + 7) % 7;
      const daysUntilSun = daysUntilSat + 1;
      return diffDays >= daysUntilSat && diffDays <= daysUntilSun;
    }
    case "Este mes":
      return (
        eDate.getMonth() === now.getMonth() &&
        eDate.getFullYear() === now.getFullYear()
      );
    case "Proximo mes": {
      const nextMonth = (now.getMonth() + 1) % 12;
      const nextYear =
        now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
      return eDate.getMonth() === nextMonth && eDate.getFullYear() === nextYear;
    }
    default:
      return true;
  }
}

export default function HomePageClient() {
  const {
    events,
    carouselEventIds,
    categories,
    isEventsLoading,
    isCategoriesLoading,
    isCarouselLoading,
  } = useAdmin();
  const [filters, setFilters] = useState<Filters>({
    query: "",
    provincia: "",
    localidad: "",
    fecha: "",
  });
  const [modalEvent, setModalEvent] = useState<Event | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(),
  );
  const sectionRef = useRef<HTMLElement>(null);

  const categoryFilters = useMemo(() => categories, [categories]);
  const normalizedCategorySet = useMemo(
    () => new Set(categories.map((category) => category.toLowerCase())),
    [categories],
  );
  const validActiveCategories = useMemo(
    () =>
      new Set(
        Array.from(activeCategories).filter((category) =>
          normalizedCategorySet.has(category.toLowerCase()),
        ),
      ),
    [activeCategories, normalizedCategorySet],
  );

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const featuredEvents = useMemo(() => {
    const eventsById = new Map(events.map((event) => [event.id, event]));
    return carouselEventIds
      .map((id) => eventsById.get(id))
      .filter((event): event is Event => Boolean(event));
  }, [events, carouselEventIds]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (
        validActiveCategories.size > 0 &&
        !validActiveCategories.has(e.category)
      ) {
        return false;
      }

      // Text query (case-insensitive)
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesText =
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.provincia.toLowerCase().includes(q) ||
          e.localidad.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // Provincia — exact match against event.provincia (case-insensitive)
      if (filters.provincia) {
        if (e.provincia.toLowerCase() !== filters.provincia.toLowerCase())
          return false;
      }

      // Localidad — exact match against event.localidad (case-insensitive)
      if (filters.localidad) {
        if (e.localidad.toLowerCase() !== filters.localidad.toLowerCase())
          return false;
      }

      // Fecha
      if (filters.fecha) {
        if (!matchesFecha(e.date, filters.fecha)) return false;
      }

      return true;
    }).slice(0, 12);
  }, [filters, validActiveCategories, events]);

  const handleSearch = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: "", provincia: "", localidad: "", fecha: "" });
    setActiveCategories(new Set());
  }, []);

  const openModal = useCallback((event: Event) => {
    setModalEvent(event);
  }, []);

  const closeModal = useCallback(() => {
    setModalEvent(null);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalEvent ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalEvent]);

  return (
    <>
      <div className="page-fade-in" style={{ position: "relative" }}>
        <Navbar />

        {/* Spacer for fixed navbar */}
        <div style={{ height: "5rem" }} />

        {/* Hero Carousel — skeleton individual */}
        {isCarouselLoading || isEventsLoading ? (
          <section
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              padding: "1.5rem 1.5rem 1rem",
            }}
            aria-busy="true"
          >
            <div
              className="skeleton-shimmer"
              style={{
                width: "100%",
                height: "clamp(14rem, 36vw, 22rem)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-color-50)",
              }}
            />
          </section>
        ) : (
          <HeroCarousel
            events={featuredEvents}
            onReserve={openModal}
            onDetails={openModal}
          />
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Starfield top — after carousel */}
        <div style={{ position: "relative", height: 0 }}>
          <div className="starfield-top" aria-hidden="true">
            <div className="star-layer star-layer-1" />
            <div className="star-layer star-layer-2" />
            <div className="star-layer star-layer-3" />
          </div>
        </div>

        {/* Events Section */}
        <section
          ref={sectionRef}
          data-nav-section="eventos"
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "3.5rem 1.5rem",
            position: "relative",
          }}
        >
          {/* Section title */}
          <h1
            style={{
              fontSize: "var(--font-2xl)",
              fontWeight: 900,
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            Eventos
          </h1>
          <p
            style={{
              fontSize: "var(--font-base)",
              color: "var(--text-disabled)",
              marginBottom: "1.5rem",
            }}
          >
            Descubri los mejores eventos cerca tuyo
          </p>

          {/* Category pills — skeleton individual */}
          {isCategoriesLoading ? (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "2.25rem",
                flexWrap: "wrap",
              }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`home-pill-skeleton-${index}`}
                  className="skeleton-shimmer"
                  style={{
                    width: `${4.5 + index * 0.4}rem`,
                    height: "2rem",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "2.25rem",
              }}
            >
              {categoryFilters.map((cat) => {
                const isActive = validActiveCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="cat-pill"
                    style={{
                      padding: "0.5rem 1.125rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--font-xs)",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      transition:
                        "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                      background: isActive
                        ? "var(--color-primary)"
                        : "var(--bg-surface-2)",
                      color: isActive ? "#1a0a2e" : "var(--text-secondary)",
                      boxShadow: isActive
                        ? "0 0 12px rgba(92, 255, 157, 0.3)"
                        : "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
              {validActiveCategories.size > 0 && (
                <button
                  onClick={() => setActiveCategories(new Set())}
                  style={{
                    padding: "0.5rem 0.875rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-xs)",
                    fontWeight: 600,
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-disabled)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <EvaIcon name="close" size={14} />
                  Limpiar
                </button>
              )}
            </div>
          )}

          {/* Event Grid — skeleton individual */}
          {isEventsLoading ? (
            <>
              <EventGridSkeleton count={6} />
              <div
                style={{
                  textAlign: "center",
                  marginTop: "1.25rem",
                  color: "var(--text-disabled)",
                }}
              >
                <p style={{ fontSize: "var(--font-sm)", fontWeight: 600 }}>
                  Cargando eventos...
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                key={`${filters.query}-${filters.provincia}-${filters.localidad}-${filters.fecha}-${Array.from(validActiveCategories).sort().join("-")}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "1rem",
                  marginTop: "2rem",
                }}
                className="event-grid"
              >
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} onReserve={openModal} />
                ))}
              </div>

              {/* Empty state */}
              {filteredEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "5rem 0" }}>
                  <div
                    className="empty-state-icon"
                    style={{
                      marginBottom: "1.25rem",
                      color: "var(--border-color)",
                    }}
                  >
                    <EvaIcon name="calendar" size={56} />
                  </div>
                  <p
                    style={{
                      color: "var(--text-disabled)",
                      fontSize: "var(--font-lg)",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    No hay eventos disponibles
                  </p>
                  <p
                    style={{
                      color: "var(--text-disabled)",
                      fontSize: "var(--font-base)",
                      opacity: 0.7,
                      marginBottom: "1.5rem",
                    }}
                  >
                    No encontramos eventos con esos filtros por ahora.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-outline"
                    style={{
                      background: "transparent",
                      color: "var(--color-primary)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 600,
                      padding: "0.625rem 1.5rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--primary-40)",
                    }}
                  >
                    Ver todos los eventos
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Starfield bottom — before footer */}
        <div style={{ position: "relative", height: 0 }}>
          <div className="starfield-bottom" aria-hidden="true">
            <div className="star-layer star-layer-1" />
            <div className="star-layer star-layer-2" />
            <div className="star-layer star-layer-3" />
          </div>
        </div>

        <Footer />

        <style>{`
        @media (min-width: 40rem) {
          .event-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
          }
        }
        @media (min-width: 64rem) {
          .event-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
      `}</style>
      </div>

      {modalEvent && <EventModal event={modalEvent} onClose={closeModal} />}
    </>
  );
}
