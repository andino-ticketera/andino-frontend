"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import {
  fetchEntradaCompleta,
  formatFechaEvento,
  getEstadoEntradaLabel,
} from "@/lib/compras-api";

interface TicketQrModalProps {
  entradaId: string | null;
  open: boolean;
  onClose: () => void;
}

function buildFilename(eventoId: string, numeroEntrada: number): string {
  return `entrada-${eventoId}-${numeroEntrada}.pdf`;
}

export default function TicketQrModal({
  entradaId,
  open,
  onClose,
}: TicketQrModalProps) {
  const {
    data: entrada,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entrada-detalle", entradaId],
    queryFn: () => fetchEntradaCompleta(String(entradaId)),
    enabled: open && Boolean(entradaId),
    retry: false,
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") {
    return null;
  }

  const downloadPdf = () => {
    if (!entrada) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    pdf.setFillColor(42, 19, 66);
    pdf.rect(0, 0, 595.28, 841.89, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("Andino Tickets", 40, 52);

    pdf.setFontSize(16);
    pdf.text(entrada.evento.titulo, 40, 88, { maxWidth: 330 });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(formatFechaEvento(entrada.evento.fecha_evento), 40, 118, {
      maxWidth: 320,
    });
    pdf.text(
      `${entrada.evento.locacion} · ${entrada.evento.direccion}`,
      40,
      138,
      {
        maxWidth: 320,
      },
    );
    pdf.text(`Comprador: ${entrada.comprador.nombre_completo}`, 40, 176, {
      maxWidth: 320,
    });
    pdf.text(`Entrada #${entrada.numero_entrada}`, 40, 196);
    pdf.text(`Estado: ${getEstadoEntradaLabel(entrada.estado)}`, 40, 216);

    pdf.setDrawColor(92, 255, 157);
    pdf.roundedRect(350, 70, 190, 220, 20, 20);
    pdf.addImage(entrada.qr_image_data_url, "PNG", 370, 92, 150, 150);
    pdf.setTextColor(226, 220, 240);
    pdf.setFontSize(10);
    pdf.text("Presenta este QR al ingresar", 374, 264);
    pdf.text(`Token: ${entrada.qr_data}`, 40, 264, { maxWidth: 280 });

    pdf.setTextColor(176, 163, 199);
    pdf.text(
      "Conserva este PDF y no compartas tu código QR con terceros.",
      40,
      790,
      { maxWidth: 500 },
    );

    pdf.save(buildFilename(entrada.evento.id, entrada.numero_entrada));
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(8, 6, 16, 0.74)",
        backdropFilter: "blur(0.625rem)",
        padding: "1rem",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(100%, 44rem)",
          borderRadius: "var(--radius-xl)",
          border: "0.0625rem solid var(--border-color)",
          background:
            "linear-gradient(180deg, var(--bg-surface-2), var(--bg-surface-1))",
          boxShadow: "0 1.875rem 5rem rgba(10, 6, 18, 0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "0.0625rem solid var(--border-color-40)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <strong style={{ fontSize: "var(--font-lg)" }}>
              Entrada con QR
            </strong>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Visualizá tu código y descargalo en PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "var(--radius-full)",
              border: "0.0625rem solid var(--border-color)",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
          {isLoading ? (
            <div
              className="skeleton-shimmer"
              style={{
                height: "26rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--bg-surface-3)",
              }}
            />
          ) : null}

          {!isLoading && error instanceof Error ? (
            <div
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-lg)",
                border: "0.0625rem solid rgba(255, 143, 143, 0.35)",
                background: "rgba(255, 143, 143, 0.08)",
                color: "#ffd0d0",
              }}
            >
              {error.message}
            </div>
          ) : null}

          {!isLoading && entrada ? (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(16.25rem, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: "0.0625rem solid var(--border-color)",
                    background: "var(--bg-base)",
                    padding: "1rem",
                    display: "grid",
                    placeItems: "center",
                    position: "relative",
                    minHeight: "20rem",
                  }}
                >
                  <img
                    src={entrada.qr_image_data_url}
                    alt={`QR de entrada ${entrada.numero_entrada}`}
                    style={{ width: "100%", maxWidth: "17rem", height: "auto" }}
                  />

                  {entrada.estado === "USADA" ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(8, 6, 16, 0.62)",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "var(--radius-xl)",
                      }}
                    >
                      <strong
                        style={{
                          color: "#ffcc66",
                          fontSize: "var(--font-xl)",
                          fontWeight: 900,
                          textTransform: "uppercase",
                        }}
                      >
                        Entrada usada
                      </strong>
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: "0.85rem" }}>
                  <div>
                    <h3
                      style={{
                        fontSize: "var(--font-xl)",
                        fontWeight: 800,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {entrada.evento.titulo}
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {formatFechaEvento(entrada.evento.fecha_evento)}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "0.45rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Entrada:
                      </strong>{" "}
                      #{entrada.numero_entrada}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Estado:
                      </strong>{" "}
                      {getEstadoEntradaLabel(entrada.estado)}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Ubicación:
                      </strong>{" "}
                      {entrada.evento.locacion}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Dirección:
                      </strong>{" "}
                      {entrada.evento.direccion}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Organiza:
                      </strong>{" "}
                      {entrada.evento.organizador}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Comprador:
                      </strong>{" "}
                      {entrada.comprador.nombre_completo}
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>
                        Email:
                      </strong>{" "}
                      {entrada.comprador.email}
                    </p>
                    {entrada.fecha_uso ? (
                      <p>
                        <strong style={{ color: "var(--text-primary)" }}>
                          Validada:
                        </strong>{" "}
                        {formatFechaEvento(entrada.fecha_uso)}
                      </p>
                    ) : null}
                  </div>

                  <div
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-lg)",
                      border: "0.0625rem solid var(--border-color)",
                      background: "var(--bg-base)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "var(--text-primary)",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Instrucciones de ingreso
                    </strong>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Presenta este QR en el acceso del evento. Si tu entrada ya
                      fue usada, el código se muestra solo como referencia.
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--text-disabled)",
                    fontSize: "var(--font-sm)",
                  }}
                >
                  Token QR: {entrada.qr_data}
                </span>

                <button
                  type="button"
                  onClick={downloadPdf}
                  style={{
                    minHeight: "3rem",
                    padding: "0 1.25rem",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#1b1029",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {'Descargar "ticket" PDF'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
