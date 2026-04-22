"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrganizer } from "@/context/OrganizerContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import {
  getManagedPaymentMethodLabel,
  getPurchaseCheckInLabel,
  isManagedPurchasePaid,
} from "@/lib/managed-purchases-api";

export default function OrganizerCheckinPage() {
  const params = useParams<{ id: string }>();
  const { events, purchases, toggleCheckedIn, showToast, isEventsLoading } =
    useOrganizer();
  const [query, setQuery] = useState("");
  const [pendingPurchaseId, setPendingPurchaseId] = useState<string | null>(
    null,
  );

  const event = events.find((item) => item.id === params.id);

  const eventPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          purchase.eventId === params.id && isManagedPurchasePaid(purchase),
      ),
    [purchases, params.id],
  );

  const filteredPurchases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return eventPurchases;
    return eventPurchases.filter(
      (purchase) =>
        `${purchase.firstName} ${purchase.lastName}`
          .toLowerCase()
          .includes(normalized) ||
        purchase.dniNumber.includes(normalized),
    );
  }, [eventPurchases, query]);

  const totalExpected = useMemo(
    () => eventPurchases.reduce((acc, purchase) => acc + purchase.quantity, 0),
    [eventPurchases],
  );

  const checkedInCount = useMemo(
    () =>
      eventPurchases.reduce(
        (acc, purchase) => acc + Math.min(purchase.checkedInCount, purchase.quantity),
        0,
      ),
    [eventPurchases],
  );

  const progressPct =
    totalExpected > 0 ? (checkedInCount / totalExpected) * 100 : 0;

  const handleToggleCheckIn = async (purchaseId: string, checkedIn: boolean) => {
    if (pendingPurchaseId) return;

    setPendingPurchaseId(purchaseId);
    try {
      await toggleCheckedIn(purchaseId, checkedIn);
      showToast(
        checkedIn ? "Check-in registrado" : "Check-in desmarcado",
        "success",
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el check-in",
        "danger",
      );
    } finally {
      setPendingPurchaseId(null);
    }
  };

  if (isEventsLoading) {
    return (
      <section>
        <p style={{ color: "var(--text-disabled)" }}>Cargando evento...</p>
      </section>
    );
  }

  if (!event) {
    return (
      <section>
        <h1
          className="section-mobile-title"
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 900,
            marginBottom: "8px",
          }}
        >
          Evento no encontrado
        </h1>
        <Link
          href="/organizador/dashboard"
          style={{ color: "var(--color-primary)" }}
        >
          Volver al panel
        </Link>
      </section>
    );
  }

  return (
    <section>
      <Link
        href="/organizador/dashboard"
        style={{
          color: "var(--text-secondary)",
          fontSize: "var(--font-sm)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "12px",
        }}
      >
        <EvaIcon name="arrow-back" size={16} /> Volver al panel
      </Link>

      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          marginBottom: "4px",
        }}
      >
        Check-in: {event.title}
      </h1>
      <p
        className="section-mobile-description"
        style={{
          color: "var(--text-disabled)",
          marginBottom: "18px",
          fontSize: "var(--font-sm)",
        }}
      >
        {event.date} - {event.time} - {event.venue}
      </p>

      <div
        className="org-checkin-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        {[
          { label: "Esperados", value: totalExpected },
          { label: "Presentes", value: checkedInCount, accent: true },
          { label: "Por llegar", value: totalExpected - checkedInCount },
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
            <p
              style={{
                fontSize: "var(--font-xl)",
                fontWeight: 900,
                color: item.accent ? "var(--color-primary)" : "inherit",
              }}
            >
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {progressPct > 0 && (
        <div
          style={{
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-md)",
            height: "0.625rem",
            marginBottom: "18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o DNI..."
        style={{
          width: "100%",
          maxWidth: "440px",
          marginBottom: "14px",
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
            No se encontraron compradores.
          </div>
        ) : (
          filteredPurchases.map((purchase) => {
            const isCheckedIn = purchase.checkedInCount >= purchase.quantity;
            const nextCheckedInState = !isCheckedIn;
            const isPending = pendingPurchaseId === purchase.id;

            return (
              <ExpandableTableRow
                key={purchase.id}
                summary={[
                  {
                    label: "Comprador",
                    value: `${purchase.firstName} ${purchase.lastName}`,
                  },
                  {
                    label: "Estado",
                    value: (
                      <span
                        style={{
                          color: isCheckedIn
                            ? "var(--color-primary)"
                            : "var(--text-disabled)",
                          fontWeight: 700,
                          fontSize: "var(--font-xs)",
                        }}
                      >
                        {getPurchaseCheckInLabel(purchase)}
                      </span>
                    ),
                  },
                  {
                    label: "Entradas",
                    value: purchase.quantity,
                  },
                ]}
                details={[
                  {
                    label: "DNI",
                    value: `${purchase.dniType} ${purchase.dniNumber}`,
                  },
                  {
                    label: "Metodo de pago",
                    value: getManagedPaymentMethodLabel(purchase.paymentMethod),
                  },
                  {
                    label: "Usadas",
                    value: `${purchase.checkedInCount}/${purchase.quantity}`,
                  },
                ]}
                actions={
                  <button
                    type="button"
                    onClick={() =>
                      void handleToggleCheckIn(purchase.id, nextCheckedInState)
                    }
                    disabled={isPending || purchase.status !== "PAGADO"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      border: isCheckedIn
                        ? "1px solid rgba(255, 80, 80, 0.25)"
                        : "1px solid rgba(92, 255, 157, 0.35)",
                      background: isCheckedIn
                        ? "rgba(255, 80, 80, 0.08)"
                        : "rgba(92, 255, 157, 0.08)",
                      color: isCheckedIn ? "#ff6b6b" : "var(--color-primary)",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 10px",
                      fontSize: "var(--font-xs)",
                      fontWeight: 700,
                      cursor:
                        isPending || purchase.status !== "PAGADO"
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        isPending || purchase.status !== "PAGADO" ? 0.6 : 1,
                    }}
                  >
                    <EvaIcon
                      name={isCheckedIn ? "close" : "checkmark"}
                      size={14}
                    />
                    {isPending
                      ? "Guardando..."
                      : isCheckedIn
                        ? "Desmarcar"
                        : "Marcar llegada"}
                  </button>
                }
              />
            );
          })
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .org-checkin-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
