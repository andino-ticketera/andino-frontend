"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { useAdmin } from "@/context/AdminContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import { deleteEventFromAdmin } from "@/lib/events-api";

interface DeleteEventDialogState {
  eventId: string;
  eventTitle: string;
}

export default function AdminEventsPage() {
  const { events, deleteEvent, showToast } = useAdmin();
  const [query, setQuery] = useState("");
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteEventDialogState | null>(null);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;

    return events.filter((event) => {
      return (
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        event.category.toLowerCase().includes(normalized)
      );
    });
  }, [events, query]);

  const handleConfirmDeleteEvent = async () => {
    if (!deleteDialog) return;

    const { eventId } = deleteDialog;
    setDeleteDialog(null);

    try {
      await deleteEventFromAdmin(eventId);
      deleteEvent(eventId);
      showToast("Evento eliminado correctamente", "danger");
    } catch {
      showToast("No se pudo eliminar el evento", "danger");
    }
  };

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
        <div>
          <h1
            className="section-mobile-title"
            style={{
              fontSize: "var(--font-2xl)",
              fontWeight: 900,
              marginBottom: "0.375rem",
            }}
          >
            Eventos
          </h1>
          <p
            className="section-mobile-description"
            style={{ color: "var(--text-disabled)" }}
          >
            Administra todos los eventos publicados.
          </p>
        </div>

        <Link
          href="/admin/eventos/nuevo"
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
          Crear evento
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por titulo, lugar o categoria..."
        style={{
          width: "100%",
          maxWidth: "440px",
          marginBottom: "0.875rem",
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
                  label: "Categoría",
                  value: event.category,
                },
                {
                  label: "Entradas",
                  value: `${event.entradasVendidas}/${event.totalEntradas}`,
                },
              ]}
              actions={
                <>
                  <Link
                    href={`/admin/eventos/${event.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "var(--text-primary)",
                      background: "var(--primary-10)",
                      border: "1px solid var(--primary-25)",
                      borderRadius: "var(--radius-sm)",
                      textDecoration: "none",
                      padding: "6px 8px",
                      fontSize: "var(--font-xs)",
                    }}
                  >
                    <EvaIcon name="edit" size={14} /> Editar
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteDialog({
                        eventId: event.id,
                        eventTitle: event.title,
                      });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "#ffd0d0",
                      background: "rgba(255, 80, 80, 0.12)",
                      border: "1px solid rgba(255, 80, 80, 0.25)",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 8px",
                      fontSize: "var(--font-xs)",
                      cursor: "pointer",
                    }}
                  >
                    <EvaIcon name="trash" size={14} /> Eliminar
                  </button>
                </>
              }
            />
          ))
        )}
      </div>

      {deleteDialog && (
        <AdminConfirmDialog
          title="Eliminar evento"
          description={
            <>
              <p>
                Estas por eliminar <strong>{deleteDialog.eventTitle}</strong>.
              </p>
              <p>Esta accion no se puede deshacer.</p>
            </>
          }
          confirmLabel="Si, eliminar"
          onClose={() => setDeleteDialog(null)}
          onConfirm={() => {
            void handleConfirmDeleteEvent();
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .events-table-container {
            border: none !important;
            background: transparent !important;
            overflow: visible !important;
          }

          .events-table {
            display: none !important;
          }

          .event-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            border: 1px solid var(--border-color) !important;
            border-radius: var(--radius-lg);
            padding: 1rem;
            margin-bottom: 0.875rem;
            background: var(--bg-surface-1);
          }

          .event-row td {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
            padding: 0 !important;
            border: none !important;
          }

          .event-row td:before {
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
