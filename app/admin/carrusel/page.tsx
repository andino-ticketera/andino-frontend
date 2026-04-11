"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import EvaIcon from "@/components/EvaIcon";
import { updateCarouselEventIds } from "@/lib/carousel-api";

function areSameIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

export default function AdminCarruselPage() {
  const { events, carouselEventIds, setCarouselEventIds, showToast } =
    useAdmin();
  const [localIds, setLocalIds] = useState<string[]>(carouselEventIds);
  const [isSaving, setIsSaving] = useState(false);

  const eventMap = useMemo(
    () => new Map(events.map((event) => [event.id, event])),
    [events],
  );

  const currentSlides = localIds
    .map((id) => eventMap.get(id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const availableEvents = events.filter(
    (event) => event.visibleInApp !== false && !localIds.includes(event.id),
  );

  const hasChanges = useMemo(
    () => !areSameIds(localIds, carouselEventIds),
    [localIds, carouselEventIds],
  );

  useEffect(() => {
    setLocalIds(carouselEventIds);
  }, [carouselEventIds]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      const persistedIds = await updateCarouselEventIds(localIds);
      setCarouselEventIds(persistedIds);
      showToast("Carrusel actualizado correctamente", "success");
    } catch {
      showToast("No se pudo guardar la configuracion del carrusel", "danger");
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, localIds, setCarouselEventIds, showToast]);

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          marginBottom: "0.375rem",
        }}
      >
        Configuracion de carrusel
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "1.125rem" }}
      >
        Selecciona hasta 6 eventos para mostrar en el hero de inicio.
      </p>
      <p
        style={{
          color: "var(--text-disabled)",
          fontSize: "var(--font-xs)",
          marginBottom: "1rem",
        }}
      >
        Los cambios en esta pantalla (agregar o quitar con la basura) se guardan
        en la base solo cuando presionas Guardar cambios.
      </p>

      <div
        className="admin-carrusel-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-md)",
              fontWeight: 800,
              marginBottom: "0.625rem",
            }}
          >
            Eventos del carrusel ({localIds.length}/6)
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {currentSlides.length === 0 && (
              <p
                style={{
                  color: "var(--text-disabled)",
                  fontSize: "var(--font-sm)",
                }}
              >
                No hay eventos seleccionados.
              </p>
            )}

            {currentSlides.map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.625rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "4rem",
                      height: "2.5rem",
                      borderRadius: "0.375rem",
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "var(--font-sm)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.title}
                    </p>
                    <p
                      style={{
                        color: "var(--text-disabled)",
                        fontSize: "var(--font-xs)",
                      }}
                    >
                      {event.date}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() =>
                      setLocalIds((prev) =>
                        prev.filter((id) => id !== event.id),
                      )
                    }
                    style={{
                      border: "1px solid rgba(255, 80, 80, 0.25)",
                      background: "rgba(255, 80, 80, 0.12)",
                      color: "#ffd0d0",
                      borderRadius: "0.5rem",
                      width: "1.875rem",
                      height: "1.875rem",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <EvaIcon name="trash" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-md)",
              fontWeight: 800,
              marginBottom: "0.625rem",
            }}
          >
            Eventos disponibles
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxHeight: "420px",
              overflow: "auto",
            }}
          >
            {availableEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.625rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "4rem",
                      height: "2.5rem",
                      borderRadius: "0.375rem",
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "var(--font-sm)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.title}
                    </p>
                    <p
                      style={{
                        color: "var(--text-disabled)",
                        fontSize: "var(--font-xs)",
                      }}
                    >
                      {event.category}
                    </p>
                  </div>
                </div>

                <button
                  disabled={localIds.length >= 6}
                  onClick={() => setLocalIds((prev) => [...prev, event.id])}
                  style={{
                    border: "1px solid var(--primary-25)",
                    background: "var(--primary-10)",
                    color: "var(--color-primary)",
                    borderRadius: "0.5rem",
                    padding: "0.375rem 0.625rem",
                    fontSize: "var(--font-xs)",
                    cursor: localIds.length >= 6 ? "not-allowed" : "pointer",
                    opacity: localIds.length >= 6 ? 0.45 : 1,
                  }}
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div
        style={{
          marginTop: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="btn-primary section-mobile-button"
          style={{
            background: "var(--color-accent)",
            color: "var(--text-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.625rem 0.875rem",
            fontWeight: 700,
            cursor: !hasChanges || isSaving ? "not-allowed" : "pointer",
            opacity: !hasChanges || isSaving ? 0.55 : 1,
          }}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>

        {!hasChanges && (
          <span
            style={{
              color: "var(--text-disabled)",
              fontSize: "var(--font-sm)",
            }}
          >
            Sin cambios pendientes
          </span>
        )}
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .admin-carrusel-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
