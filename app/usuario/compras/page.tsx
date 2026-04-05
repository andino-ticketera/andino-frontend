"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchMisCompras,
  formatFechaCompra,
  formatFechaEvento,
  formatPrecio,
  getEstadoCompraBadgeColor,
  getEstadoCompraLabel,
  getMetodoPagoLabel,
} from "@/lib/compras-api";
import { readAuthSession } from "@/lib/auth-client";

export default function MisComprasPage() {
  const router = useRouter();

  const {
    data: compras = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mis-compras"],
    queryFn: fetchMisCompras,
    retry: false,
  });

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      router.replace("/iniciar-sesion?redirect=/usuario/compras");
    }
  }, [router]);

  useEffect(() => {
    if (error instanceof Error && error.message === "No autenticado") {
      router.replace("/iniciar-sesion?redirect=/usuario/compras");
    }
  }, [error, router]);

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
        }}
      >
        <section
          style={{
            display: "grid",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              width: "fit-content",
              padding: "0.45rem 0.85rem",
              borderRadius: "var(--radius-full)",
              border: "0.0625rem solid var(--primary-25)",
              background: "var(--primary-08)",
              color: "var(--color-primary)",
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Mi cuenta
          </span>

          <div>
            <h1
              className="section-mobile-title"
              style={{
                fontSize: "var(--font-3xl)",
                lineHeight: "var(--leading-tight)",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              Mis compras y entradas
            </h1>
            <p
              className="section-mobile-description"
              style={{
                color: "var(--text-secondary)",
                maxWidth: "48rem",
              }}
            >
              Revisa tus compras, entra al detalle de cada pedido y recupera tus
              entradas con QR cuando lo necesites.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div
            style={{
              display: "grid",
              gap: "1rem",
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer"
                style={{
                  borderRadius: "var(--radius-xl)",
                  height: "13rem",
                  border: "0.0625rem solid var(--border-color)",
                  background: "var(--bg-surface-1)",
                }}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && error instanceof Error ? (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: "var(--radius-xl)",
              border: "0.0625rem solid rgba(255, 143, 143, 0.35)",
              background: "rgba(255, 143, 143, 0.08)",
              color: "#ffd0d0",
            }}
          >
            {error.message || "No se pudieron cargar tus compras"}
          </div>
        ) : null}

        {!isLoading && !error && compras.length === 0 ? (
          <section
            style={{
              borderRadius: "var(--radius-xl)",
              border: "0.0625rem solid var(--border-color)",
              background:
                "linear-gradient(180deg, var(--bg-surface-2), var(--bg-surface-1))",
              padding: "2rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>
                Todavia no realizaste ninguna compra
              </h2>
              <p
                style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}
              >
                Cuando compres entradas vas a poder verlas aca y revisar el
                detalle de cada pedido desde tu cuenta.
              </p>
            </div>

            <div>
              <Link
                href="/explorar"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "3rem",
                  padding: "0 1.25rem",
                  borderRadius: "var(--radius-full)",
                  textDecoration: "none",
                  background: "var(--color-primary)",
                  color: "#1b1029",
                  fontWeight: 800,
                }}
              >
                Explorar eventos
              </Link>
            </div>
          </section>
        ) : null}

        {!isLoading && !error && compras.length > 0 ? (
          <section style={{ display: "grid", gap: "1rem" }}>
            {compras.map((compra) => (
              <Link
                key={compra.id}
                href={`/usuario/compras/${compra.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <article
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: "0.0625rem solid var(--border-color)",
                    background:
                      "linear-gradient(180deg, var(--bg-surface-2), var(--bg-surface-1))",
                    padding: "1.5rem",
                    display: "grid",
                    gap: "1.25rem",
                    boxShadow: "0 1.125rem 3.125rem rgba(18, 8, 32, 0.25)",
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
                      style={{
                        display: "grid",
                        gap: "0.6rem",
                        flex: "1 1 32rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <h2
                          style={{
                            fontSize: "var(--font-xl)",
                            fontWeight: 800,
                          }}
                        >
                          {compra.evento_titulo}
                        </h2>
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
                            letterSpacing: "0.04em",
                          }}
                        >
                          {getEstadoCompraLabel(compra.estado)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "0.35rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <p>{formatFechaEvento(compra.fecha_evento)}</p>
                        <p>{compra.ubicacion_evento}</p>
                        <p>Organiza {compra.nombre_organizador}</p>
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: "14rem",
                        display: "grid",
                        gap: "0.35rem",
                        justifyItems: "end",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "1.9rem",
                          lineHeight: 1,
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatPrecio(compra.precio_total)}
                      </strong>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {compra.cantidad}{" "}
                        {compra.cantidad === 1 ? "entrada" : "entradas"}
                      </span>
                      <span
                        style={{
                          color: "var(--text-disabled)",
                          fontSize: "var(--font-sm)",
                        }}
                      >
                        {formatPrecio(compra.precio_unitario)} c/u
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      paddingTop: "1rem",
                      borderTop: "0.0625rem solid var(--border-color-40)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>{getMetodoPagoLabel(compra.metodo_pago)}</span>
                    <span>
                      Compra realizada el{" "}
                      {formatFechaCompra(compra.fecha_compra)}
                    </span>
                    <span
                      style={{ color: "var(--color-primary)", fontWeight: 700 }}
                    >
                      Ver detalle y entradas
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
