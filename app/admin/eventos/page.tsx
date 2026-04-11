"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { useAdmin } from "@/context/AdminContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import { isEventFinished } from "@/data/events";
import {
  deleteEventFromAdmin,
  updateEventVisibilityFromAdmin,
} from "@/lib/events-api";

interface DeleteEventDialogState {
  eventId: string;
  eventTitle: string;
}

type VisibilityFilter = "all" | "visible" | "hidden";
type TimeFilter = "proximos" | "finalizados" | "todos";

export default function AdminEventsPage() {
  const { events, deleteEvent, updateEvent, showToast, isEventsLoading } =
    useAdmin();
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("proximos");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteEventDialogState | null>(null);
  const [pendingVisibilityId, setPendingVisibilityId] = useState<string | null>(
    null,
  );

  const proximosCount = useMemo(
    () => events.filter((event) => !isEventFinished(event)).length,
    [events],
  );
  const finalizadosCount = events.length - proximosCount;

  const timeFilteredEvents = useMemo(() => {
    if (timeFilter === "todos") return events;
    const wantFinished = timeFilter === "finalizados";
    return events.filter((event) => isEventFinished(event) === wantFinished);
  }, [events, timeFilter]);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return timeFilteredEvents.filter((event) => {
      if (visibilityFilter === "visible" && event.visibleInApp === false) {
        return false;
      }
      if (visibilityFilter === "hidden" && event.visibleInApp !== false) {
        return false;
      }

      if (!normalized) return true;

      return (
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        event.category.toLowerCase().includes(normalized)
      );
    });
  }, [timeFilteredEvents, query, visibilityFilter]);

  const visibleCount = useMemo(
    () =>
      timeFilteredEvents.filter((event) => event.visibleInApp !== false).length,
    [timeFilteredEvents],
  );
  const hiddenCount = timeFilteredEvents.length - visibleCount;
  const isFinalizadosView = timeFilter === "finalizados";

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

  const handleToggleVisibility = async (
    eventId: string,
    visibleInApp: boolean,
  ) => {
    if (pendingVisibilityId) return;

    setPendingVisibilityId(eventId);
    try {
      const updatedEvent = await updateEventVisibilityFromAdmin(
        eventId,
        visibleInApp,
      );
      updateEvent(eventId, updatedEvent);
      showToast(
        visibleInApp
          ? "Evento visible nuevamente en inicio y explorar"
          : "Evento oculto del inicio y explorar",
        "success",
      );
    } catch {
      showToast("No se pudo actualizar la visibilidad del evento", "danger");
    } finally {
      setPendingVisibilityId(null);
    }
  };

  return (
    <section>
      <div
        className="section-mobile-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
        <div className="section-mobile-copy">
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
            Administra los eventos y decide en segundos si se muestran o no en
            la app.
          </p>
        </div>

        <Link
          href="/admin/eventos/nuevo"
          className="btn-primary section-mobile-button section-mobile-cta"
          style={{
            background: "var(--color-accent)",
            color: "var(--text-primary)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "12px 16px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <EvaIcon name="plus" size={16} />
          <span>Crear evento</span>
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filtro por fecha del evento"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        {[
          {
            key: "proximos" as const,
            label: "Proximos",
            count: proximosCount,
          },
          {
            key: "finalizados" as const,
            label: "Finalizados",
            count: finalizadosCount,
          },
          {
            key: "todos" as const,
            label: "Todos",
            count: events.length,
          },
        ].map((item) => {
          const isActive = timeFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTimeFilter(item.key)}
              style={{
                flex: "1 1 7rem",
                minWidth: "7rem",
                border: isActive
                  ? "1px solid rgba(92, 255, 157, 0.55)"
                  : "1px solid var(--border-color)",
                background: isActive
                  ? "rgba(92, 255, 157, 0.16)"
                  : "var(--bg-surface-1)",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                padding: "0.625rem 0.875rem",
                fontWeight: 800,
                fontSize: "var(--font-sm)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  fontSize: "var(--font-xs)",
                  fontWeight: 700,
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--text-disabled)",
                }}
              >
                ({item.count})
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.625rem",
          marginBottom: "0.875rem",
        }}
      >
        {[
          {
            key: "all" as const,
            label: `Todos (${timeFilteredEvents.length})`,
          },
          { key: "visible" as const, label: `Visibles (${visibleCount})` },
          { key: "hidden" as const, label: `Ocultos (${hiddenCount})` },
        ].map((item) => {
          const isActive = visibilityFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setVisibilityFilter(item.key)}
              style={{
                border: isActive
                  ? "1px solid rgba(92, 255, 157, 0.4)"
                  : "1px solid var(--border-color)",
                background: isActive
                  ? "rgba(92, 255, 157, 0.12)"
                  : "var(--bg-surface-1)",
                color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                borderRadius: "999px",
                padding: "0.5rem 0.875rem",
                fontWeight: 700,
                fontSize: "var(--font-xs)",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          );
        })}
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
          filteredEvents.map((event) => {
            const isVisible = event.visibleInApp !== false;
            const isPending = pendingVisibilityId === event.id;

            if (isFinalizadosView) {
              return (
                <article
                  key={event.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3rem 1fr auto",
                    gap: "0.75rem",
                    alignItems: "center",
                    padding: "0.625rem 0.75rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface-1)",
                    opacity: 0.92,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="3rem"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: "var(--font-sm)",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--text-disabled)",
                        margin: "0.125rem 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.date} · {event.entradasVendidas}/
                      {event.totalEntradas} vendidas
                    </p>
                  </div>

                  <Link
                    href={`/admin/eventos/${event.id}`}
                    aria-label={`Ver detalle de ${event.title}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "var(--text-secondary)",
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      textDecoration: "none",
                      padding: "0.375rem 0.625rem",
                      fontSize: "var(--font-xs)",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <EvaIcon name="eye" size={14} />
                    <span>Ver</span>
                  </Link>
                </article>
              );
            }

            return (
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
                    label: "Visibilidad",
                    value: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: isVisible ? "var(--color-primary)" : "#f4b942",
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: "0.5rem",
                            height: "0.5rem",
                            borderRadius: "999px",
                            background: isVisible
                              ? "var(--color-primary)"
                              : "#f4b942",
                          }}
                        />
                        {isVisible ? "Visible" : "Oculto"}
                      </span>
                    ),
                  },
                ]}
                details={[
                  {
                    label: "Fecha",
                    value: event.date,
                  },
                  {
                    label: "Lugar",
                    value: event.venue,
                  },
                  {
                    label: "Precio",
                    value: `$${event.price.toFixed(2)}`,
                  },
                  {
                    label: "Categoria",
                    value: event.category,
                  },
                  {
                    label: "Entradas",
                    value: `${event.entradasVendidas}/${event.totalEntradas}`,
                  },
                ]}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        void handleToggleVisibility(event.id, !isVisible)
                      }
                      disabled={isPending}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: isVisible ? "#f4b942" : "var(--color-primary)",
                        background: isVisible
                          ? "rgba(244, 185, 66, 0.12)"
                          : "rgba(92, 255, 157, 0.08)",
                        border: isVisible
                          ? "1px solid rgba(244, 185, 66, 0.25)"
                          : "1px solid rgba(92, 255, 157, 0.25)",
                        borderRadius: "var(--radius-sm)",
                        padding: "6px 8px",
                        fontSize: "var(--font-xs)",
                        cursor: isPending ? "not-allowed" : "pointer",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      <EvaIcon
                        name={isVisible ? "close" : "sun"}
                        size={14}
                      />
                      {isPending
                        ? "Guardando..."
                        : isVisible
                          ? "Ocultar en app"
                          : "Mostrar en app"}
                    </button>

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
            );
          })
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

      {isEventsLoading && (
        <p
          style={{
            marginTop: "0.875rem",
            color: "var(--text-disabled)",
            fontSize: "var(--font-sm)",
          }}
        >
          Cargando eventos reales...
        </p>
      )}
    </section>
  );
}
