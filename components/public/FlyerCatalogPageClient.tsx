"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Event } from "@/data/events";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EvaIcon from "@/components/EvaIcon";
import SearchBar from "@/components/SearchBar";
import { FlyerGridSkeleton } from "@/components/EventSkeletons";
import { useAdmin } from "@/context/AdminContext";

const EventModal = dynamic(() => import("@/components/EventModal"), {
  ssr: false,
});

interface Filters {
  query: string;
  provincia: string;
  localidad: string;
  fecha: string;
}

const monthsMap: Record<string, number> = {
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

function parseEventDate(dateStr: string): Date {
  const parts = dateStr.replace(",", "").split(" ");
  if (parts.length < 3) return new Date(0);
  const day = parseInt(parts[0], 10);
  const month = monthsMap[parts[1]] ?? 0;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

function parseEventTime(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function matchesFecha(eventDate: string, fecha: string): boolean {
  if (!fecha) return true;

  const event = parseEventDate(eventDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
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
        event.getMonth() === now.getMonth() &&
        event.getFullYear() === now.getFullYear()
      );
    case "Proximo mes": {
      const nextMonth = (now.getMonth() + 1) % 12;
      const nextYear =
        now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
      return event.getMonth() === nextMonth && event.getFullYear() === nextYear;
    }
    default:
      return true;
  }
}

export default function FlyerCatalogPageClient() {
  const { events, categories, isEventsLoading } = useAdmin();
  const [modalEvent, setModalEvent] = useState<Event | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(),
  );
  const [filters, setFilters] = useState<Filters>({
    query: "",
    provincia: "",
    localidad: "",
    fecha: "",
  });

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

  const sortedEvents = useMemo(() => {
    const filtered = events.filter((e) => {
      if (
        validActiveCategories.size > 0 &&
        !validActiveCategories.has(e.category)
      ) {
        return false;
      }

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

      if (filters.provincia) {
        if (e.provincia.toLowerCase() !== filters.provincia.toLowerCase()) {
          return false;
        }
      }

      if (filters.localidad) {
        if (e.localidad.toLowerCase() !== filters.localidad.toLowerCase()) {
          return false;
        }
      }

      if (filters.fecha && !matchesFecha(e.date, filters.fecha)) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = parseEventDate(a.date).getTime();
      const dateB = parseEventDate(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return parseEventTime(a.time) - parseEventTime(b.time);
    });
  }, [filters, validActiveCategories, events]);

  const openModal = useCallback((event: Event) => {
    setModalEvent(event);
  }, []);

  const closeModal = useCallback(() => {
    setModalEvent(null);
  }, []);

  const handleSearch = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: "", provincia: "", localidad: "", fecha: "" });
    setActiveCategories(new Set());
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalEvent ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalEvent]);

  if (isEventsLoading) {
    return (
      <div className="page-fade-in">
        <Navbar />
        <div style={{ height: "5rem" }} />

        <section
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "3rem 1.5rem 4rem",
            minHeight: "55vh",
          }}
          aria-busy="true"
        >
          <div
            style={{ marginBottom: "1.5rem", display: "grid", gap: "0.625rem" }}
          >
            <div
              className="skeleton-shimmer"
              style={{
                width: "13rem",
                height: "1.75rem",
                borderRadius: "var(--radius-sm)",
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: "18rem",
                height: "0.875rem",
                borderRadius: "var(--radius-full)",
                maxWidth: "100%",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`explorar-pill-skeleton-${index}`}
                className="skeleton-shimmer"
                style={{
                  width: `${4.75 + index * 0.35}rem`,
                  height: "2rem",
                  borderRadius: "var(--radius-full)",
                }}
              />
            ))}
          </div>

          <FlyerGridSkeleton count={8} />
          <div
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              color: "var(--text-disabled)",
            }}
          >
            <p style={{ fontSize: "var(--font-sm)", fontWeight: 600 }}>
              Cargando cartelera...
            </p>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page-fade-in">
      <Navbar />
      <div style={{ height: "5rem" }} />
      <SearchBar onSearch={handleSearch} />

      <section
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 900,
            color: "var(--color-primary)",
            marginBottom: "0.25rem",
            letterSpacing: "-0.01em",
          }}
        >
          Proximos eventos
        </h1>
        <p
          style={{
            fontSize: "var(--font-base)",
            color: "var(--text-disabled)",
            marginBottom: "1.5rem",
          }}
        >
          No te pierdas lo que viene
        </p>

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1.25rem",
          }}
          className="cartelera-grid"
        >
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="cartelera-card"
              onClick={() => openModal(event)}
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                background: "var(--bg-surface-1)",
                border: "1px solid var(--border-color-50)",
                cursor: "pointer",
                transition:
                  "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "9 / 16",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={event.flyer}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="cartelera-card-img"
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "55%",
                    background:
                      "linear-gradient(to top, rgba(42,19,66,0.95) 0%, rgba(42,19,66,0.5) 55%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "1rem",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "var(--font-base)",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      lineHeight: 1.25,
                      textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {event.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "var(--font-xs)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <EvaIcon name="calendar" size={13} />
                    <span>{event.date}</span>
                    <span style={{ opacity: 0.4, margin: "0 2px" }}>|</span>
                    <EvaIcon name="clock" size={13} />
                    <span>{event.time} hs</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "var(--font-xs)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <EvaIcon name="pin" size={13} />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.venue}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "var(--font-xs)",
                      color: "var(--text-disabled)",
                    }}
                  >
                    <EvaIcon name="navigation" size={13} />
                    <span>
                      {event.localidad}, {event.provincia}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedEvents.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div
              className="empty-state-icon"
              style={{ marginBottom: "1.25rem", color: "var(--border-color)" }}
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
                padding: "10px 24px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--primary-40)",
              }}
            >
              Ver todos los eventos
            </button>
          </div>
        )}
      </section>

      <Footer />

      {modalEvent && <EventModal event={modalEvent} onClose={closeModal} />}

      <style>{`
        .cartelera-card:hover {
          transform: translateY(-0.375rem);
          border-color: var(--primary-50) !important;
          box-shadow: 0 1rem 2.5rem rgba(42, 19, 66, 0.5), 0 0 0 0.0625rem var(--primary-25);
        }
        .cartelera-card:hover .cartelera-card-img {
          transform: scale(1.05);
        }
        .cartelera-card-img {
          transition: transform 0.4s ease;
        }
        .cat-pill:hover {
          background: var(--bg-surface-3) !important;
        }
        @media (min-width: 48rem) {
          .cartelera-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 64rem) {
          .cartelera-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
