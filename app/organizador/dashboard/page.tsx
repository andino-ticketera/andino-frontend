"use client";

import { startTransition, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useOrganizer } from "@/context/OrganizerContext";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import {
  fetchOrganizerMercadoPagoConnectUrl,
  fetchOrganizerMercadoPagoStatus,
} from "@/lib/mercadopago-api";
import {
  formatManagedPurchaseDate,
  getManagedPaymentMethodLabel,
  getManagedPurchaseStatusColor,
  getManagedPurchaseStatusLabel,
  isManagedPurchasePaid,
} from "@/lib/managed-purchases-api";

export default function OrganizerDashboardPage() {
  const {
    events,
    purchases,
    organizer,
    isPurchasesLoading,
    isEventsLoading,
  } = useOrganizer();
  const [isConnectingMp, setIsConnectingMp] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [mpQueryStatus] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search).get("mp");
  });

  const { data: mpStatus } = useQuery({
    queryKey: ["organizer-mercadopago-status"],
    queryFn: fetchOrganizerMercadoPagoStatus,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const paidPurchases = useMemo(
    () => purchases.filter(isManagedPurchasePaid),
    [purchases],
  );

  const totalRevenue = useMemo(
    () => paidPurchases.reduce((acc, p) => acc + p.totalPrice, 0),
    [paidPurchases],
  );

  const commission = totalRevenue * 0.05;
  const netRevenue = totalRevenue - commission;

  const stats = [
    { label: "Recaudado bruto", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Comision Andino (5%)", value: `$${commission.toFixed(2)}` },
    { label: "Ganancia neta", value: `$${netRevenue.toFixed(2)}` },
  ];

  const recentPurchases = useMemo(
    () =>
      [...paidPurchases]
        .sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime(),
        )
        .slice(0, 5),
    [paidPurchases],
  );

  const mpBannerMessage =
    mpQueryStatus === "connected"
      ? "Mercado Pago quedo conectado para este organizador."
      : mpQueryStatus === "error"
        ? "No se pudo completar la conexion con Mercado Pago."
        : null;

  const handleConnectMercadoPago = async () => {
    if (isConnectingMp) return;

    setConnectError(null);
    setIsConnectingMp(true);

    try {
      const url = await fetchOrganizerMercadoPagoConnectUrl();
      startTransition(() => {
        window.location.assign(url);
      });
    } catch (error) {
      setConnectError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la conexion con Mercado Pago",
      );
      setIsConnectingMp(false);
    }
  };

  const mpStatusColor =
    mpStatus?.status === "CONECTADA"
      ? "#54c98f"
      : mpStatus?.status === "REQUIERE_RECONEXION"
        ? "#f4b942"
        : "#ff7a7a";

  const mpHeadline =
    mpStatus?.status === "CONECTADA"
      ? "Cobros activos"
      : mpStatus?.status === "REQUIERE_RECONEXION"
        ? "Reconecta tu cuenta"
        : mpStatus?.mode === "platform_test"
          ? "Modo test disponible"
          : "Activa cobros con Mercado Pago";

  const mpDescription =
    mpStatus?.status === "CONECTADA"
      ? mpStatus?.mpEmail
        ? `Tu cuenta ${mpStatus.mpEmail} ya estÃ¡ autorizada para cobrar con Mercado Pago.`
        : "Tu cuenta de Mercado Pago ya estÃ¡ autorizada para cobrar con Mercado Pago."
      : mpStatus?.status === "REQUIERE_RECONEXION"
        ? "Mercado Pago pidiÃ³ una nueva autorizaciÃ³n. ReconectÃ¡ para seguir cobrando en tus eventos."
        : mpStatus?.mode === "platform_test"
          ? "En desarrollo podes seguir con la cuenta plataforma o conectar tu propia cuenta sandbox para ver el flujo real del organizador."
          : "Solo tenÃ©s que conectar tu cuenta una vez. DespuÃ©s publicÃ¡s eventos y cobrÃ¡s con Mercado Pago de forma simple.";

  const mpActionLabel =
    mpStatus?.status === "CONECTADA"
      ? "Actualizar conexiÃ³n"
      : mpStatus?.status === "REQUIERE_RECONEXION"
        ? "Reconectar cuenta"
        : mpStatus?.mode === "platform_test"
          ? "Conectar cuenta sandbox"
          : "Activar cobros";

  return (
    <section>
      <h1
        className="org-dashboard-title section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          color: "var(--color-primary)",
          marginBottom: "6px",
        }}
      >
        Panel de {organizer.empresa || "tu organizacion"}
      </h1>
      <p
        className="org-dashboard-description section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "20px" }}
      >
        Resumen de ventas y ganancias de tus eventos.
      </p>

      {(mpBannerMessage || connectError) && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface-1)",
            color: connectError ? "#ff9b9b" : "var(--text-primary)",
          }}
        >
          {connectError || mpBannerMessage}
        </div>
      )}

      <article
        style={{
          background: "var(--bg-surface-1)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.125rem",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-disabled)",
              fontWeight: 700,
            }}
          >
            Cobros con Mercado Pago
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: "0.625rem",
                height: "0.625rem",
                borderRadius: "50%",
                background: mpStatusColor,
                boxShadow: `0 0 0 0.1875rem ${mpStatusColor}25`,
              }}
            />
            <strong style={{ fontSize: "var(--font-sm)" }}>{mpHeadline}</strong>
          </div>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "var(--text-disabled)",
              fontSize: "var(--font-xs)",
              lineHeight: 1.5,
            }}
          >
            {mpDescription}
          </p>
        </div>

        <button
          type="button"
          onClick={handleConnectMercadoPago}
          disabled={isConnectingMp}
          style={{
            border:
              mpStatus?.status !== "CONECTADA"
                ? "none"
                : "1px solid var(--border-color)",
            borderRadius: "var(--radius-full)",
            background:
              mpStatus?.status !== "CONECTADA"
                ? "var(--color-primary)"
                : "transparent",
            color:
              mpStatus?.status !== "CONECTADA" ? "#06130f" : "var(--text-secondary)",
            fontWeight: mpStatus?.status !== "CONECTADA" ? 800 : 700,
            padding:
              mpStatus?.status !== "CONECTADA"
                ? "0.75rem 1rem"
                : "0.5rem 0.875rem",
            fontSize:
              mpStatus?.status !== "CONECTADA"
                ? "var(--font-sm)"
                : "var(--font-xs)",
            cursor: isConnectingMp ? "not-allowed" : "pointer",
          }}
        >
          {isConnectingMp ? "Conectando..." : mpActionLabel}
        </button>
      </article>

      <div
        className="org-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
            }}
          >
            <p
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </p>
            <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      {events.length > 0 && (
        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <h2 style={{ fontSize: "var(--font-md)", fontWeight: 800 }}>
              Desglose por evento
            </h2>
          </div>
          <div style={{ padding: "0.875rem" }}>
            {events.map((event) => {
              const eventPurchases = purchases.filter(
                (purchase) => purchase.eventId === event.id,
              );
              const eventRevenue = eventPurchases
                .filter((purchase) => purchase.status === "PAGADO")
                .reduce((acc, purchase) => acc + purchase.totalPrice, 0);

              return (
                <ExpandableTableRow
                  key={event.id}
                  summary={[
                    {
                      label: "Evento",
                      value: event.title,
                    },
                    {
                      label: "Entradas",
                      value: `${event.entradasVendidas}/${event.totalEntradas}`,
                    },
                    {
                      label: "Bruto",
                      value: `$${eventRevenue.toFixed(2)}`,
                    },
                  ]}
                  details={[
                    {
                      label: "Neto",
                      value: `$${(eventRevenue * 0.95).toFixed(2)}`,
                    },
                  ]}
                  actions={
                    <Link
                      href={`/organizador/dashboard/checkin/${event.id}`}
                      style={{
                        color: "var(--color-primary)",
                        fontSize: "var(--font-xs)",
                        fontWeight: 700,
                        textDecoration: "none",
                        border: "1px solid var(--primary-25)",
                        background: "var(--primary-10)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.375rem 0.625rem",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      Tomar lista
                    </Link>
                  }
                />
              );
            })}
          </div>
        </article>
      )}

      <article
        style={{
          background: "var(--bg-surface-1)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-md)", fontWeight: 800 }}>
            Compras recientes
          </h2>
        </div>

        <div style={{ padding: "0.875rem" }}>
          {recentPurchases.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-disabled)",
                padding: "1rem",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
              }}
            >
              Aun no hay compras registradas.
            </p>
          ) : (
            recentPurchases.map((purchase) => (
              <ExpandableTableRow
                key={purchase.id}
                summary={[
                  {
                    label: "Comprador",
                    value: `${purchase.firstName} ${purchase.lastName}`,
                  },
                  {
                    label: "Evento",
                    value: purchase.eventTitle || "—",
                  },
                  {
                    label: "Total",
                    value: `$${purchase.totalPrice.toFixed(2)}`,
                  },
                ]}
                details={[
                  {
                    label: "Cantidad",
                    value: purchase.quantity,
                  },
                  {
                    label: "Pago",
                    value: getManagedPaymentMethodLabel(purchase.paymentMethod),
                  },
                  {
                    label: "Estado",
                    value: (
                      <span
                        style={{
                          color: getManagedPurchaseStatusColor(purchase.status),
                          fontWeight: 700,
                        }}
                      >
                        {getManagedPurchaseStatusLabel(purchase.status)}
                      </span>
                    ),
                  },
                  {
                    label: "Fecha",
                    value: formatManagedPurchaseDate(purchase.purchaseDate),
                  },
                ]}
              />
            ))
          )}
        </div>
      </article>

      {(isPurchasesLoading || isEventsLoading) && (
        <p
          style={{
            marginTop: "0.875rem",
            color: "var(--text-disabled)",
            fontSize: "var(--font-sm)",
          }}
        >
          Sincronizando eventos y compras reales...
        </p>
      )}

      <style>{`
        @media (max-width: 768px) {
          article[style*="grid-template-columns: minmax(0, 1fr) auto"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 900px) {
          .org-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 768px) {
          .org-dashboard-title {
            font-size: 1.375rem !important;
            margin-bottom: 0.25rem !important;
          }

          .org-dashboard-description {
            font-size: 0.8125rem !important;
            margin-bottom: 0.875rem !important;
          }
        }
        @media (max-width: 480px) {
          .org-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }

          .org-dashboard-title {
            font-size: 1.25rem !important;
          }

          .org-dashboard-description {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
}
