"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchPublicCheckoutStatus,
  type PublicCheckoutStatus,
} from "@/lib/mercadopago-api";
import { downloadPurchaseConfirmation } from "@/lib/purchase-confirmation-export";

function formatPrice(value: number): string {
  return `$${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value))}`;
}

function getStatusTitle(status?: PublicCheckoutStatus["estado"]): string {
  if (status === "PAGADO") return "Pago acreditado exitosamente";
  if (status === "CANCELADO") return "Pago cancelado o rechazado";
  return "Pago en proceso";
}

function getStatusCopy(status?: PublicCheckoutStatus["estado"]): string {
  if (status === "PAGADO") {
    return "Tu compra fue registrada correctamente. Si usaste un medio inmediato, las entradas ya deberían quedar emitidas. Revisá tu email y acordate de mirar spam, promociones y las demás bandejas por si el mensaje llega filtrado.";
  }
  if (status === "CANCELADO") {
    return "Mercado Pago informó que el pago no se acreditó. Podés volver al evento e intentarlo otra vez.";
  }
  return "Todavía estamos esperando la confirmación final del pago. Si acabás de pagar, refrescá esta pantalla en unos segundos.";
}

function CheckoutEstadoContent() {
  const searchParams = useSearchParams();
  const [downloadingFormat, setDownloadingFormat] = useState<
    "jpg" | "png" | "pdf" | null
  >(null);
  const compraId = useMemo(
    () => (searchParams.get("compra") || "").trim(),
    [searchParams],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-checkout-status", compraId],
    queryFn: () => fetchPublicCheckoutStatus(compraId),
    enabled: compraId.length > 0,
    refetchInterval: (query) =>
      query.state.data?.estado === "PENDIENTE" ? 4000 : false,
  });

  const title = useMemo(() => getStatusTitle(data?.estado), [data?.estado]);
  const copy = useMemo(() => getStatusCopy(data?.estado), [data?.estado]);

  const handleDownload = async (format: "jpg" | "png" | "pdf") => {
    if (!data) return;
    setDownloadingFormat(format);
    try {
      await downloadPurchaseConfirmation(data, format);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 16rem)",
          padding: "8rem 1rem 4rem",
          background:
            "radial-gradient(circle at top, rgba(92,255,157,0.10), transparent 32%), var(--bg-base)",
        }}
      >
        <section
          style={{
            width: "min(100%, 48rem)",
            margin: "0 auto",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-surface-1)",
            padding: "1.5rem",
            boxShadow: "0 1.25rem 3rem rgba(0,0,0,0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-primary)",
              fontWeight: 800,
            }}
          >
            Estado del checkout
          </p>

          <h1
            style={{
              margin: "0.75rem 0 0.5rem",
              fontSize: "var(--font-2xl)",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {copy}
          </p>

          {data?.estado === "PAGADO" ? (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.9375rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(92,255,157,0.2)",
                background: "rgba(92,255,157,0.08)",
                color: "var(--text-primary)",
                lineHeight: 1.55,
                fontSize: "var(--font-sm)",
              }}
            >
              Tus entradas se envían por email. Si no las ves enseguida, revisá
              spam, promociones, social y el resto de tus bandejas.
            </div>
          ) : null}

          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface-2)",
            }}
          >
            {isLoading ? (
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Consultando estado de la compra...
              </p>
            ) : error ? (
              <p style={{ margin: 0, color: "#ff9b9b" }}>
                {error instanceof Error
                  ? error.message
                  : "No se pudo leer el estado del checkout"}
              </p>
            ) : data ? (
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {[
                  // Nota: omitimos compraId (UUID crudo) y mpStatus (detalle
                  // interno de Mercado Pago) para no exponer ruido técnico al
                  // comprador. Si se necesita para soporte, sigue disponible
                  // en el backend (GET /api/pagos/public/:compraId).
                  ["Evento", data.eventoTitulo],
                  ["Cantidad", String(data.cantidad)],
                  ["Total", formatPrice(data.total)],
                  ["Email", data.compradorEmail],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: "var(--text-disabled)" }}>
                      {label}
                    </span>
                    <strong style={{ textAlign: "right" }}>{value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                No se encontró una compra para consultar.
              </p>
            )}
          </div>

          {data?.estado === "PAGADO" ? (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                background: "var(--bg-surface-2)",
                display: "grid",
                gap: "0.875rem",
              }}
            >
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <strong style={{ fontSize: "var(--font-md)" }}>
                  Descargar confirmación
                </strong>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    lineHeight: 1.55,
                  }}
                >
                  Podés guardar este comprobante en `JPG`, `PNG` o `PDF` desde
                  el celu o la compu.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {(["jpg", "png", "pdf"] as const).map((format) => {
                  const isBusy = downloadingFormat === format;

                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => void handleDownload(format)}
                      disabled={Boolean(downloadingFormat)}
                      style={{
                        minHeight: "3rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid var(--border-color)",
                        background: isBusy
                          ? "rgba(92,255,157,0.12)"
                          : "var(--bg-surface-1)",
                        color: "var(--text-primary)",
                        fontWeight: 800,
                        cursor: downloadingFormat ? "wait" : "pointer",
                        width: "100%",
                      }}
                    >
                      {isBusy
                        ? `Generando ${format.toUpperCase()}...`
                        : `Descargar ${format.toUpperCase()}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div
            style={{
              marginTop: "1.25rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/explorar"
              style={{
                borderRadius: "var(--radius-full)",
                padding: "0.75rem 1rem",
                textDecoration: "none",
                background: "var(--color-primary)",
                color: "#04110d",
                fontWeight: 800,
              }}
            >
              Volver a explorar eventos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutEstadoPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutEstadoContent />
    </Suspense>
  );
}
