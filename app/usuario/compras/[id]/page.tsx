"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TicketQrModal from "@/components/usuario/TicketQrModal";
import { readAuthSession } from "@/lib/auth-client";
import {
  fetchCompraDetalle,
  formatFechaCompra,
  formatPrecio,
  getEstadoCompraBadgeColor,
  getEstadoCompraLabel,
  getEstadoEntradaLabel,
  getMetodoPagoLabel,
} from "@/lib/compras-api";

export default function CompraDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedEntradaId, setSelectedEntradaId] = useState<string | null>(
    null,
  );

  const compraId = String(params?.id || "").trim();

  const {
    data: compra,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["compra-detalle", compraId],
    queryFn: () => fetchCompraDetalle(compraId),
    enabled: compraId.length > 0,
    retry: false,
  });

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      router.replace(`/iniciar-sesion?redirect=/usuario/compras/${compraId}`);
    }
  }, [compraId, router]);

  useEffect(() => {
    if (error instanceof Error && error.message === "No autenticado") {
      router.replace(`/iniciar-sesion?redirect=/usuario/compras/${compraId}`);
    }
  }, [compraId, error, router]);

  return (
    <div className="page-fade-in">
      <Navbar />
      <div style={{ height: "5rem" }} />

      <main
        style={{
          minHeight: "calc(100vh - 5rem)",
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          display: "grid",
          gap: "1.25rem",
        }}
      >
        <div>
          <Link
            href="/usuario/compras"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--color-primary)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver a mis compras
          </Link>
        </div>

        {isLoading ? (
          <div
            className="skeleton-shimmer"
            style={{
              height: "28rem",
              borderRadius: "var(--radius-xl)",
              background: "var(--bg-surface-2)",
            }}
          />
        ) : null}

        {!isLoading && error instanceof Error ? (
          <section
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-xl)",
              border: "0.0625rem solid rgba(255, 143, 143, 0.35)",
              background: "rgba(255, 143, 143, 0.08)",
              color: "#ffd0d0",
            }}
          >
            {error.message}
          </section>
        ) : null}

        {!isLoading && compra ? (
          <>
            <section
              style={{
                borderRadius: "var(--radius-xl)",
                border: "0.0625rem solid var(--border-color)",
                background:
                  "linear-gradient(180deg, var(--bg-surface-2), var(--bg-surface-1))",
                padding: "1.5rem",
                display: "grid",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div
                  style={{ display: "grid", gap: "0.55rem", flex: "1 1 30rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <h1
                      style={{ fontSize: "var(--font-2xl)", fontWeight: 900 }}
                    >
                      {compra.evento_titulo}
                    </h1>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "0.35rem 0.7rem",
                        borderRadius: "var(--radius-full)",
                        background: `${getEstadoCompraBadgeColor(compra.estado)}20`,
                        border: `0.0625rem solid ${getEstadoCompraBadgeColor(compra.estado)}55`,
                        color: getEstadoCompraBadgeColor(compra.estado),
                        fontSize: "var(--font-xs)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {getEstadoCompraLabel(compra.estado)}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {compra.ubicacion_evento}
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Organiza {compra.nombre_organizador}
                  </p>
                </div>

                <div
                  style={{
                    minWidth: "14rem",
                    display: "grid",
                    justifyItems: "end",
                    gap: "0.4rem",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "1.9rem",
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatPrecio(compra.precio_total)}
                  </strong>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {compra.cantidad}{" "}
                    {compra.cantidad === 1 ? "entrada" : "entradas"}
                  </span>
                  <span style={{ color: "var(--text-disabled)" }}>
                    {getMetodoPagoLabel(compra.metodo_pago)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(13.75rem, 1fr))",
                  gap: "0.85rem",
                }}
              >
                {[
                  ["ID de compra", compra.id],
                  ["Fecha de compra", formatFechaCompra(compra.fecha_compra)],
                  ["Precio unitario", formatPrecio(compra.precio_unitario)],
                  ["Metodo de pago", getMetodoPagoLabel(compra.metodo_pago)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "0.0625rem solid var(--border-color)",
                      background: "var(--bg-base)",
                      padding: "1rem",
                      display: "grid",
                      gap: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-disabled)",
                        fontSize: "var(--font-sm)",
                      }}
                    >
                      {label}
                    </span>
                    <strong
                      style={{
                        fontSize: "var(--font-md)",
                        lineBreak: "anywhere" as const,
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                borderRadius: "var(--radius-xl)",
                border: "0.0625rem solid var(--border-color)",
                background: "var(--bg-surface-1)",
                padding: "1.5rem",
                display: "grid",
                gap: "1rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>
                  Entradas de esta compra
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "0.35rem",
                  }}
                >
                  Cada entrada tiene su propio QR y puede descargarse por
                  separado.
                </p>
              </div>

              <div style={{ display: "grid", gap: "0.85rem" }}>
                {compra.entradas.map((entrada) => (
                  <article
                    key={entrada.id}
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "0.0625rem solid var(--border-color)",
                      background: "var(--bg-base)",
                      padding: "1rem",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1rem",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "grid", gap: "0.3rem" }}>
                      <strong style={{ fontSize: "var(--font-md)" }}>
                        Entrada #{entrada.numero_entrada}
                      </strong>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Estado: {getEstadoEntradaLabel(entrada.estado)}
                      </span>
                      <span
                        style={{
                          color: "var(--text-disabled)",
                          fontSize: "var(--font-sm)",
                        }}
                      >
                        {entrada.qr_token ? `Token: ${entrada.qr_token}` : `Entrada #${entrada.numero_entrada}`}
                      </span>
                      {entrada.fecha_uso ? (
                        <span
                          style={{
                            color: "#ffcc66",
                            fontSize: "var(--font-sm)",
                          }}
                        >
                          Validada el {formatFechaCompra(entrada.fecha_uso)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEntradaId(entrada.id)}
                      style={{
                        minHeight: "3rem",
                        padding: "0 1.15rem",
                        borderRadius: "var(--radius-full)",
                        border: "0.0625rem solid var(--primary-25)",
                        background: "var(--primary-10)",
                        color: "var(--color-primary)",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {'Ver QR y descargar "ticket"'}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <TicketQrModal
        entradaId={selectedEntradaId}
        open={Boolean(selectedEntradaId)}
        onClose={() => setSelectedEntradaId(null)}
      />

      <Footer />
    </div>
  );
}
