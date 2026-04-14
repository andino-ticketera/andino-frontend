"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import EvaIcon from "@/components/EvaIcon";
import ExpandableTableRow from "@/components/ExpandableTableRow";
import { downloadPurchaseConfirmation } from "@/lib/purchase-confirmation-export";
import {
  buildPurchaseConfirmationStatus,
  canResendManagedPurchaseEmail,
  formatManagedPurchaseDate,
  getManagedPaymentMethodLabel,
  getManagedPurchaseStatusColor,
  getManagedPurchaseStatusLabel,
  isManagedPurchasePaid,
  resendAdminPurchaseEmail,
} from "@/lib/managed-purchases-api";

export default function AdminCompradoresPage() {
  const { purchases, events, isPurchasesLoading, showToast } = useAdmin();
  const [eventFilter, setEventFilter] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );
  const [resendingPurchaseId, setResendingPurchaseId] = useState<string | null>(
    null,
  );
  const [downloadingPurchaseId, setDownloadingPurchaseId] = useState<
    string | null
  >(null);

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

  const handleResendEmail = async (purchaseId: string) => {
    setResendingPurchaseId(purchaseId);
    try {
      const message = await resendAdminPurchaseEmail(purchaseId);
      showToast(message, "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el email",
        "danger",
      );
    } finally {
      setResendingPurchaseId(null);
    }
  };

  const handleDownloadEntry = async (purchaseId: string) => {
    const purchase = filteredPurchases.find((item) => item.id === purchaseId);
    if (!purchase) return;

    setDownloadingPurchaseId(purchaseId);
    try {
      await downloadPurchaseConfirmation(
        buildPurchaseConfirmationStatus(purchase),
        "pdf",
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo descargar la entrada",
        "danger",
      );
    } finally {
      setDownloadingPurchaseId(null);
    }
  };

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
        Compradores
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "1.125rem" }}
      >
        Analisis de ventas y detalle de compras reales.
      </p>

      <div
        className="admin-buyers-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-disabled)",
              textTransform: "uppercase",
            }}
          >
            Compras pagadas
          </p>
          <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
            {filteredPurchases.length}
          </p>
        </article>
        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-disabled)",
              textTransform: "uppercase",
            }}
          >
            Ingresos cobrados
          </p>
          <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
            ${revenue.toFixed(2)}
          </p>
        </article>
        <article
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-disabled)",
              textTransform: "uppercase",
            }}
          >
            Ticket promedio
          </p>
          <p style={{ fontSize: "var(--font-xl)", fontWeight: 900 }}>
            ${avgTicket.toFixed(2)}
          </p>
        </article>
      </div>

      <select
        value={eventFilter}
        onChange={(e) => setEventFilter(e.target.value)}
        style={{
          marginBottom: "0.75rem",
          border: "1px solid var(--border-color)",
          background: "#ffffff",
          color: "#1f1f1f",
          borderRadius: "var(--radius-md)",
          padding: "0.625rem 0.75rem",
          fontSize: "var(--font-sm)",
          minWidth: "260px",
        }}
      >
        <option value="">Todos los eventos</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>

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
                  value: purchase.eventTitle || "Evento eliminado",
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
                  label: "Precio unitario",
                  value: `$${purchase.unitPrice.toFixed(2)}`,
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
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedPurchaseId(purchase.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      border: "1px solid var(--primary-25)",
                      background: "var(--primary-10)",
                      color: "var(--color-primary)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.375rem 0.625rem",
                      fontSize: "var(--font-xs)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <EvaIcon name="person" size={14} /> Ver datos
                  </button>

                  {canResendManagedPurchaseEmail(purchase) ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleResendEmail(purchase.id)}
                        disabled={resendingPurchaseId === purchase.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          border: "1px solid rgba(92, 255, 157, 0.3)",
                          background: "rgba(92, 255, 157, 0.08)",
                          color: "var(--color-primary)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.375rem 0.625rem",
                          fontSize: "var(--font-xs)",
                          fontWeight: 700,
                          cursor:
                            resendingPurchaseId === purchase.id
                              ? "wait"
                              : "pointer",
                          opacity: resendingPurchaseId === purchase.id ? 0.7 : 1,
                        }}
                      >
                        <EvaIcon name="email-outline" size={14} />
                        {resendingPurchaseId === purchase.id
                          ? "Reenviando..."
                          : "Reenviar email"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDownloadEntry(purchase.id)}
                        disabled={downloadingPurchaseId === purchase.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-surface-1)",
                          color: "var(--text-primary)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.375rem 0.625rem",
                          fontSize: "var(--font-xs)",
                          fontWeight: 700,
                          cursor:
                            downloadingPurchaseId === purchase.id
                              ? "wait"
                              : "pointer",
                          opacity:
                            downloadingPurchaseId === purchase.id ? 0.7 : 1,
                        }}
                      >
                        <EvaIcon name="download-outline" size={14} />
                        {downloadingPurchaseId === purchase.id
                          ? "Descargando..."
                          : "Descargar entrada"}
                      </button>
                    </>
                  ) : null}
                </>
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
            padding: "1.125rem",
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
              padding: "1.125rem",
              boxShadow: "0 0.875rem 1.75rem rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.875rem",
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
                  borderRadius: "0.5rem",
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
                gap: "0.625rem",
              }}
              className="admin-contact-grid"
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
                    padding: "0.625rem",
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
                marginTop: "0.875rem",
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
                  padding: "0.5rem 0.75rem",
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
          .admin-buyers-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .admin-contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .admin-buyers-stats {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }
        }
      `}</style>
    </section>
  );
}
