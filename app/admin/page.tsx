"use client";

import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import {
  formatManagedPurchaseDate,
  getManagedPaymentMethodLabel,
  getManagedPurchaseStatusColor,
  getManagedPurchaseStatusLabel,
  isManagedPurchasePaid,
} from "@/lib/managed-purchases-api";

export default function AdminDashboardPage() {
  const {
    events,
    purchases,
    carouselEventIds,
    isEventsLoading,
    isPurchasesLoading,
  } = useAdmin();

  const paidPurchases = useMemo(
    () => purchases.filter(isManagedPurchasePaid),
    [purchases],
  );

  const totalRevenue = useMemo(
    () =>
      paidPurchases.reduce((acc, purchase) => acc + purchase.totalPrice, 0),
    [paidPurchases],
  );

  const stats = [
    { label: "Total de eventos", value: String(events.length) },
    { label: "Compras pagadas", value: String(paidPurchases.length) },
    { label: "Ingresos cobrados", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Slides del carrusel", value: String(carouselEventIds.length) },
  ];

  const recentPurchases = useMemo(() => {
    return [...paidPurchases]
      .sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime(),
      )
      .slice(0, 5);
  }, [paidPurchases]);

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          color: "var(--color-primary)",
          marginBottom: "0.375rem",
        }}
      >
        Panel de administración
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "1.25rem" }}
      >
        Resumen general del estado de eventos y compras.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "0.875rem",
          marginBottom: "1.375rem",
        }}
        className="admin-stats-grid"
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                marginBottom: "0.375rem",
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
              Aún no hay compras registradas.
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
                    value: purchase.eventTitle || "Evento eliminado",
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
                    label: "Pago",
                    value: getManagedPaymentMethodLabel(purchase.paymentMethod),
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

      {(isEventsLoading || isPurchasesLoading) && (
        <p
          style={{
            marginTop: "0.875rem",
            color: "var(--text-disabled)",
            fontSize: "var(--font-sm)",
          }}
        >
          Actualizando datos reales del panel...
        </p>
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 480px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }
        }
      `}</style>
    </section>
  );
}

