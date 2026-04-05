"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrganizer } from "@/context/OrganizerContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";

export default function OrganizerCheckinPage() {
  const params = useParams<{ id: string }>();
  const { events, purchases, toggleCheckedIn } = useOrganizer();
  const [query, setQuery] = useState("");

  const event = events.find((e) => e.id === params.id);

  const eventPurchases = useMemo(
    () => purchases.filter((p) => p.eventId === params.id),
    [purchases, params.id],
  );

  const filteredPurchases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return eventPurchases;
    return eventPurchases.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(normalized) ||
        p.dniNumber.includes(normalized),
    );
  }, [eventPurchases, query]);

  const totalExpected = useMemo(
    () => eventPurchases.reduce((acc, p) => acc + p.quantity, 0),
    [eventPurchases],
  );

  const checkedInCount = useMemo(
    () =>
      eventPurchases
        .filter((p) => p.checkedIn)
        .reduce((acc, p) => acc + p.quantity, 0),
    [eventPurchases],
  );

  const progressPct =
    totalExpected > 0 ? (checkedInCount / totalExpected) * 100 : 0;

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
        {event.date} — {event.time} — {event.venue}
      </p>

      {/* Stats */}
      <div
        className="org-checkin-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <article
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
            Esperados
          </p>
          <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
            {totalExpected}
          </p>
        </article>
        <article
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
            Presentes
          </p>
          <p
            style={{
              fontSize: "var(--font-xl)",
              fontWeight: 900,
              color: "var(--color-primary)",
            }}
          >
            {checkedInCount}
          </p>
        </article>
        <article
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
            Por llegar
          </p>
          <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
            {totalExpected - checkedInCount}
          </p>
        </article>
      </div>

      {/* Progress bar */}
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

      {/* Search */}
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

      {/* Table */}
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
          filteredPurchases.map((p) => (
            <ExpandableTableRow
              key={p.id}
              summary={[
                {
                  label: "Comprador",
                  value: `${p.firstName} ${p.lastName}`,
                },
                {
                  label: "Estado",
                  value: (
                    <span
                      style={{
                        color: p.checkedIn
                          ? "var(--color-primary)"
                          : "var(--text-disabled)",
                        fontWeight: 700,
                        fontSize: "var(--font-xs)",
                      }}
                    >
                      {p.checkedIn ? "✓ Presente" : "Ausente"}
                    </span>
                  ),
                },
                {
                  label: "Entradas",
                  value: p.quantity,
                },
              ]}
              details={[
                {
                  label: "DNI",
                  value: `${p.dniType} ${p.dniNumber}`,
                },
                {
                  label: "Método de pago",
                  value: p.paymentMethod,
                },
              ]}
              actions={
                <button
                  type="button"
                  onClick={() => toggleCheckedIn(p.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    border: p.checkedIn
                      ? "1px solid rgba(255, 80, 80, 0.25)"
                      : "1px solid rgba(92, 255, 157, 0.35)",
                    background: p.checkedIn
                      ? "rgba(255, 80, 80, 0.08)"
                      : "rgba(92, 255, 157, 0.08)",
                    color: p.checkedIn ? "#ff6b6b" : "var(--color-primary)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 10px",
                    fontSize: "var(--font-xs)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <EvaIcon
                    name={p.checkedIn ? "close" : "checkmark"}
                    size={14}
                  />
                  {p.checkedIn ? "Desmarcar" : "Marcar llegada"}
                </button>
              }
            />
          ))
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
