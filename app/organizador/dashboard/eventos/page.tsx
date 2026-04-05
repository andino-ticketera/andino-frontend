"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useOrganizer } from "@/context/OrganizerContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";

export default function OrganizerEventsPage() {
  const { events } = useOrganizer();
  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        event.category.toLowerCase().includes(normalized),
    );
  }, [events, query]);

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <h1
            className="section-mobile-title"
            style={{
              fontSize: "var(--font-2xl)",
              fontWeight: 900,
              marginBottom: "6px",
            }}
          >
            Mis eventos
          </h1>
          <p
            className="section-mobile-description"
            style={{ color: "var(--text-disabled)" }}
          >
            Gestion de tus eventos publicados.
          </p>
        </div>

        <Link
          href="/organizador/dashboard/eventos/nuevo"
          className="btn-primary section-mobile-button"
          style={{
            background: "var(--color-accent)",
            color: "var(--text-primary)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            padding: "10px 14px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Publicar evento
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por titulo, lugar o categoria..."
        style={{
          width: "100%",
          maxWidth: "440px",
          marginBottom: "14px",
          border: "1px solid var(--border-color)",
          background: "#ffffff",
          color: "#1f1f1f",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          fontSize: "var(--font-sm)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-disabled)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            No se encontraron eventos.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <ExpandableTableRow
              key={event.id}
              summary={[
                {
                  label: "Imagen",
                  value: (
                    <div
                      style={{
                        position: "relative",
                        width: "48px",
                        height: "32px",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ),
                },
                {
                  label: "Evento",
                  value: event.title,
                },
                {
                  label: "Fecha",
                  value: event.date,
                },
              ]}
              details={[
                {
                  label: "Lugar",
                  value: event.venue,
                },
                {
                  label: "Precio",
                  value: `$${event.price.toFixed(2)}`,
                },
                {
                  label: "Entradas",
                  value: `${event.entradasVendidas}/${event.totalEntradas}`,
                },
              ]}
              actions={
                <Link
                  href={`/organizador/dashboard/eventos/${event.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--text-primary)",
                    background: "var(--primary-10)",
                    border: "1px solid var(--primary-25)",
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    padding: "6px 8px",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  <EvaIcon name="edit" size={14} />
                  Editar
                </Link>
              }
            />
          ))
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .org-events-table-container {
            border: none !important;
            background: transparent !important;
            overflow: visible !important;
          }

          .org-events-table {
            display: none !important;
          }

          .org-event-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            border: 1px solid var(--border-color) !important;
            border-radius: var(--radius-lg);
            padding: 1rem;
            margin-bottom: 0.875rem;
            background: var(--bg-surface-1);
          }

          .org-event-row td {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
            padding: 0 !important;
            border: none !important;
          }

          .org-event-row td:before {
            content: attr(data-label);
            font-size: var(--font-xs);
            font-weight: 700;
            color: var(--text-disabled);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          tbody {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </section>
  );
}
