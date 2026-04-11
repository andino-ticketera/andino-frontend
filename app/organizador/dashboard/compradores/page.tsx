"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useOrganizer } from "@/context/OrganizerContext";
import EvaIcon from "@/components/EvaIcon";
import { downloadBuyersCsv } from "@/components/organizador/exportCsv";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import {
  formatManagedPurchaseDate,
  getManagedPaymentMethodLabel,
  getManagedPurchaseStatusColor,
  getManagedPurchaseStatusLabel,
  isManagedPurchasePaid,
} from "@/lib/managed-purchases-api";

export default function OrganizerCompradoresPage() {
  const { purchases, events, isPurchasesLoading } = useOrganizer();
  const [eventFilter, setEventFilter] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );

  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const filteredPurchases = useMemo(() => {
    const paidPurchases = purchases.filter(isManagedPurchasePaid);
    if (!eventFilter) return paidPurchases;
    return paidPurchases.filter((purchase) => purchase.eventId === eventFilter);
  }, [purchases, eventFilter]);

  const revenue = useMemo(
    () => filteredPurchases.reduce((acc, purchase) => acc + purchase.totalPrice, 0),
    [filteredPurchases],
  );

  const avgTicket = useMemo(() => {
    const totalQty = filteredPurchases.reduce(
      (acc, purchase) => acc + purchase.quantity,
      0,
    );
    if (totalQty === 0) return 0;
    return revenue / totalQty;
  }, [filteredPurchases, revenue]);

  const selectedPurchase = useMemo(
    () =>
      filteredPurchases.find((purchase) => purchase.id === selectedPurchaseId) ??
      null,
    [filteredPurchases, selectedPurchaseId],
  );

  const handleDownloadCsv = () => {
    const eventTitle = eventFilter
      ? (eventMap.get(eventFilter)?.title ?? "todos")
      : "todos";
    downloadBuyersCsv(filteredPurchases, eventTitle);
  };

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          marginBottom: "6px",
        }}
      >
        Compradores
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "18px" }}
      >
        Detalle de ventas y listado real de compradores de tus eventos.
      </p>

      <div
        className="org-buyers-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        {[
          { label: "Compras pagadas", value: filteredPurchases.length },
          { label: "Recaudacion", value: `$${revenue.toFixed(2)}` },
          { label: "Ticket promedio", value: `$${avgTicket.toFixed(2)}` },
        ].map((item) => (
          <article
            key={item.label}
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "14px",
            }}
          >
            <p
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </p>
            <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          style={{
            border: "1px solid var(--border-color)",
            background: "#ffffff",
            color: "#1f1f1f",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            fontSize: "var(--font-sm)",
            minWidth: "260px",
          }}
        >
          <option value="">Todos mis eventos</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={filteredPurchases.length === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid var(--primary-25)",
            background: "var(--primary-10)",
            color: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: "var(--font-sm)",
            fontWeight: 700,
            cursor: filteredPurchases.length === 0 ? "not-allowed" : "pointer",
            opacity: filteredPurchases.length === 0 ? 0.5 : 1,
          }}
        >
          <EvaIcon name="download" size={16} />
          Descargar CSV
        </button>

        {eventFilter && (
          <Link
            href={`/organizador/dashboard/checkin/${eventFilter}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid rgba(92, 255, 157, 0.35)",
              background: "rgba(92, 255, 157, 0.08)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <EvaIcon name="checkmark-circle" size={16} />
            Check-in en puerta
          </Link>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {filteredPurchases.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-disabled)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            No hay compras para mostrar.
          </div>
        ) : (
          filteredPurchases.map((purchase) => (
            <ExpandableTableRow
              key={purchase.id}
              summary={[
                {
                  label: "Comprador",
                  value: `${purchase.firstName} ${purchase.lastName}`,
                },
                {
                  label: "Evento",
                  value: purchase.eventTitle || eventMap.get(purchase.eventId)?.title || "—",
                },
                {
                  label: "Total",
                  value: `$${purchase.totalPrice.toFixed(2)}`,
                },
              ]}
              details={[
                {
                  label: "DNI",
                  value: `${purchase.dniType} ${purchase.dniNumber}`,
                },
                {
                  label: "Email",
                  value: purchase.email,
                },
                {
                  label: "Cantidad",
                  value: purchase.quantity,
                },
                {
                  label: "Metodo de pago",
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
              actions={
                <button
                  type="button"
                  onClick={() => setSelectedPurchaseId(purchase.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid var(--primary-25)",
                    background: "var(--primary-10)",
                    color: "var(--color-primary)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 10px",
                    fontSize: "var(--font-xs)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <EvaIcon name="person" size={14} /> Ver datos
                </button>
              }
            />
          ))
        )}
      </div>

      {selectedPurchase && (
        <div
          onClick={() => setSelectedPurchaseId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(14, 9, 26, 0.72)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "18px",
              boxShadow: "0 14px 28px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 800 }}>
                Datos del comprador
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPurchaseId(null)}
                aria-label="Cerrar"
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: "var(--bg-surface-2)",
                  color: "var(--text-primary)",
                  width: "1.875rem",
                  height: "1.875rem",
                  cursor: "pointer",
                }}
              >
                <EvaIcon name="close" size={14} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
              className="org-contact-grid"
            >
              {[
                {
                  label: "Nombre",
                  value: `${selectedPurchase.firstName} ${selectedPurchase.lastName}`,
                },
                { label: "Email", value: selectedPurchase.email },
                {
                  label: "Documento",
                  value: `${selectedPurchase.dniType} ${selectedPurchase.dniNumber}`,
                },
                {
                  label: "Estado",
                  value: getManagedPurchaseStatusLabel(selectedPurchase.status),
                },
              ].map((item) => (
                <article
                  key={item.label}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px",
                    background: "var(--bg-surface-2)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-disabled)",
                      fontSize: "var(--font-xs)",
                    }}
                  >
                    {item.label}
                  </p>
                  <p style={{ fontWeight: 700 }}>{item.value}</p>
                </article>
              ))}
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPurchaseId(null)}
                style={{
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface-2)",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPurchasesLoading && (
        <p
          style={{
            marginTop: "0.875rem",
            color: "var(--text-disabled)",
            fontSize: "var(--font-sm)",
          }}
        >
          Cargando compras reales...
        </p>
      )}

      <style>{`
        @media (max-width: 900px) {
          .org-buyers-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .org-contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .org-buyers-stats {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }
        }
      `}</style>
    </section>
  );
}
