"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Event } from "@/data/events";
import Image from "next/image";
import Link from "next/link";
import EvaIcon from "./EvaIcon";
import { createCheckoutPreference } from "@/lib/mercadopago-api";
import { readAuthSession } from "@/lib/auth-client";
import {
  readStoredBuyerProfile,
  writeStoredBuyerProfile,
} from "@/lib/buyer-profile";
import { fetchBuyerProfile } from "@/lib/compras-api";

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const SERVICE_FEE_RATE = 0.05; // 5%

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  padding: "0.625rem 0.75rem",
  color: "#1f1f1f",
  fontSize: "var(--font-sm)",
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--font-xs)",
  color: "var(--text-secondary)",
  marginBottom: "0.25rem",
  display: "block",
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "2rem",
  cursor: "pointer",
};

function splitFullName(fullName: string): { nombre: string; apellido: string } {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { nombre: "", apellido: "" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { nombre: parts[0], apellido: "" };
  }

  return {
    nombre: parts.slice(0, -1).join(" "),
    apellido: parts[parts.length - 1],
  };
}

function applyIfEmpty(
  value: string,
  setter: React.Dispatch<React.SetStateAction<string>>,
): void {
  if (!value.trim()) return;

  setter((current) => (current.trim() ? current : value.trim()));
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [dniType, setDniType] = useState("DNI");
  const [dniNumber, setDniNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "transferencia" | "mercadopago"
  >(event.mediosDePago[0] ?? "mercadopago");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);
  const [isLoadingBuyerProfile, setIsLoadingBuyerProfile] = useState(false);

  const unitPrice = event.price;
  const serviceFee = Math.round(unitPrice * SERVICE_FEE_RATE * 100) / 100;
  const totalPerTicket = unitPrice + serviceFee;
  const total = totalPerTicket * quantity;

  const formatArsVisual = useCallback((value: number) => {
    const rounded = Math.round(value);
    return `$${new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded)}`;
  }, []);

  const organizerName = event.organizador || event.venue.split(",")[0].trim();

  const isFormValid = useMemo(
    () =>
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      dniNumber.trim() !== "" &&
      email.includes("@") &&
      email === confirmEmail &&
      acceptedTerms,
    [firstName, lastName, dniNumber, email, confirmEmail, acceptedTerms],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const session = readAuthSession();
    const sessionEmail = session?.user.email?.trim() || "";
    const sessionNames = splitFullName(session?.user.nombreCompleto || "");

    applyIfEmpty(sessionNames.nombre, setFirstName);
    applyIfEmpty(sessionNames.apellido, setLastName);
    applyIfEmpty(sessionEmail, setEmail);
    applyIfEmpty(sessionEmail, setConfirmEmail);

    const storedProfile = readStoredBuyerProfile();
    if (storedProfile) {
      applyIfEmpty(storedProfile.nombre, setFirstName);
      applyIfEmpty(storedProfile.apellido, setLastName);
      applyIfEmpty(storedProfile.documento, setDniNumber);
      applyIfEmpty(storedProfile.email, setEmail);
      applyIfEmpty(storedProfile.email, setConfirmEmail);
      setDniType((current) =>
        current.trim() && current !== "DNI"
          ? current
          : storedProfile.tipoDocumento || current,
      );
    }

    if (!session?.user?.id) {
      return;
    }

    let cancelled = false;

    const hydrateBuyerProfile = async () => {
      setIsLoadingBuyerProfile(true);

      try {
        const buyerProfile = await fetchBuyerProfile();
        if (!buyerProfile || cancelled) {
          return;
        }

        applyIfEmpty(buyerProfile.nombre, setFirstName);
        applyIfEmpty(buyerProfile.apellido, setLastName);
        applyIfEmpty(buyerProfile.documento, setDniNumber);
        applyIfEmpty(buyerProfile.email, setEmail);
        applyIfEmpty(buyerProfile.email, setConfirmEmail);
        setDniType((current) =>
          current.trim() && current !== "DNI"
            ? current
            : buyerProfile.tipoDocumento || current,
        );
      } catch {
        // Best effort hydration. The form remains editable without saved data.
      } finally {
        if (!cancelled) {
          setIsLoadingBuyerProfile(false);
        }
      }
    };

    void hydrateBuyerProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapsQuery = useMemo(
    () => encodeURIComponent(event.venue),
    [event.venue],
  );

  const modalFlyerSrc = useMemo(() => {
    try {
      const parsed = new URL(event.flyer);
      if (parsed.hostname.includes("images.unsplash.com")) {
        parsed.searchParams.delete("fit");
        parsed.searchParams.delete("h");
        parsed.searchParams.set("w", "1200");
        parsed.searchParams.set("q", "80");
      }
      return parsed.toString();
    } catch {
      return event.flyer;
    }
  }, [event.flyer]);

  const decrementQty = useCallback(
    () => setQuantity((q) => Math.max(1, q - 1)),
    [],
  );
  const incrementQty = useCallback(
    () => setQuantity((q) => Math.min(10, q + 1)),
    [],
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "var(--bg-base)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          width: "calc(100% - 32px)",
          maxWidth: "1200px",
          maxHeight: "95vh",
          overflow: "hidden",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border-color-30)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "0.875rem",
            right: "0.875rem",
            zIndex: 10,
            color: "var(--text-disabled)",
            background: "var(--bg-surface-2)",
            border: "none",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Cerrar"
        >
          <EvaIcon name="close" size={18} />
        </button>

        <div className="modal-layout" style={{ display: "flex" }}>
          {/* Column 1 — Flyer */}
          <div
            className="modal-flyer"
            style={{
              width: "23.75rem",
              flexShrink: 0,
              position: "relative",
              background: "var(--bg-base)",
              borderRadius: "var(--radius-xl) 0 0 var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            <Image
              src={modalFlyerSrc}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 380px"
              className="modal-flyer-image"
              style={{ objectFit: "contain", objectPosition: "center" }}
              priority
            />
          </div>

          {/* Column 2 — Info + Map + Organizer */}
          <div
            className="modal-info-col"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Section: Event Info ── */}
            <div style={{ marginBottom: "1.25rem" }}>
              {/* Category */}
              <span
                style={{
                  fontSize: "var(--font-xs)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.375rem",
                  display: "block",
                }}
              >
                {event.category}
              </span>

              {/* Title */}
              <h2
                style={{
                  fontSize: "var(--font-xl)",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                  marginBottom: "0.75rem",
                }}
              >
                {event.title}
              </h2>

              {/* Description */}
              <p
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {event.longDescription}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "var(--border-color)",
                marginBottom: "1rem",
              }}
            />

            {/* ── Section: Date, Time & Location ── */}
            <div style={{ marginBottom: "1.25rem" }}>
              {/* Date & Time */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.625rem",
                }}
              >
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>
                  <EvaIcon name="calendar" size={16} />
                </span>
                <span
                  style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {event.date}
                </span>
                <span style={{ color: "var(--border-color)", margin: "0 2px" }}>
                  |
                </span>
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>
                  <EvaIcon name="clock" size={16} />
                </span>
                <span
                  style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {event.time} hs
                </span>
              </div>

              {/* Location */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  paddingTop: "0.5rem",
                }}
              >
                <span
                  style={{
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <EvaIcon name="pin" size={16} />
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "var(--text-primary)",
                      fontWeight: 700,
                    }}
                  >
                    {event.venue.split(",")[0]}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--font-xs)",
                      color: "var(--text-disabled)",
                    }}
                  >
                    {event.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section: Map (centered) ── */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  height: "15rem",
                  width: "100%",
                }}
              >
                <iframe
                  title="Ubicacion del evento"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                />
              </div>
            </div>

            {/* ── Section: Organizer (bottom) ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: "auto",
              }}
            >
              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {organizerName}
                </p>
                <p
                  style={{
                    fontSize: "var(--font-xs)",
                    color: "var(--text-disabled)",
                    marginTop: "0.125rem",
                  }}
                >
                  Organizador verificado
                </p>
              </div>

              {/* Verified badge */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
                <path
                  d="M7.5 12.5l3 3 6-6"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Column 3 — Purchase form */}
          <div
            className="modal-form-col"
            style={{
              width: "18.75rem",
              flexShrink: 0,
              padding: "1.75rem 1.75rem 1.75rem 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Quantity + Price */}
            <div
              className="modal-pricing-block"
              style={{ marginBottom: "0.75rem" }}
            >
              <h4
                style={{
                  fontSize: "var(--font-xs)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Cantidad de Entradas
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={decrementQty}
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface-1)",
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                    }}
                  >
                    —
                  </button>
                  <span
                    style={{
                      fontSize: "var(--font-base)",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      width: "1.375rem",
                      textAlign: "center",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-surface-1)",
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  {event.price === 0 ? (
                    <p
                      style={{
                        fontSize: "var(--font-base)",
                        fontWeight: 900,
                        color: "var(--color-primary)",
                      }}
                    >
                      Gratis
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-disabled)",
                        }}
                      >
                        {formatArsVisual(unitPrice)} c/u
                      </p>
                      <p
                        style={{
                          fontSize: "var(--font-base)",
                          fontWeight: 900,
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatArsVisual(total)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              {event.price > 0 && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 0.625rem",
                    background: "var(--bg-surface-1)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.6875rem",
                    color: "var(--text-disabled)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.1875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Entrada{quantity > 1 ? ` x${quantity}` : ""}</span>
                    <span>{formatArsVisual(unitPrice * quantity)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Costo de servicio</span>
                    <span>{formatArsVisual(serviceFee * quantity)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: "0.25rem",
                      marginTop: "0.125rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>Total</span>
                    <span>{formatArsVisual(total)}</span>
                  </div>
                </div>
              )}
            </div>

            <div
              className="modal-pricing-divider"
              style={{
                height: "1px",
                background: "var(--border-color)",
                marginBottom: "0.75rem",
              }}
            />

            <h4
              style={{
                fontSize: "var(--font-xs)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Datos del Comprador
            </h4>

            {isLoadingBuyerProfile ? (
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                Cargando tus datos guardados...
              </p>
            ) : null}

            {/* DNI */}
            <div
              className="modal-form-row-dni"
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: "0.5rem",
                marginBottom: "0.625rem",
              }}
            >
              <div>
                <label style={labelStyle}>Tipo Doc.</label>
                <select
                  value={dniType}
                  onChange={(e) => setDniType(e.target.value)}
                  style={selectStyle}
                >
                  <option value="DNI">DNI</option>
                  <option value="LC">LC</option>
                  <option value="LE">LE</option>
                  <option value="CI">CI</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nro. Documento</label>
                <input
                  type="text"
                  value={dniNumber}
                  onChange={(e) => setDniNumber(e.target.value)}
                  placeholder="12345678"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Name */}
            <div
              className="modal-form-row-name"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                marginBottom: "0.625rem",
              }}
            >
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Perez"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "0.625rem" }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                style={inputStyle}
              />
            </div>

            {/* Confirm Email */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Confirmar Email</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                style={{
                  ...inputStyle,
                  borderColor:
                    confirmEmail && confirmEmail !== email
                      ? "#ff4d4f"
                      : "var(--border-color)",
                }}
              />
              {confirmEmail && confirmEmail !== email && (
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "#ff4d4f",
                    marginTop: "0.125rem",
                  }}
                >
                  Los emails no coinciden
                </p>
              )}
            </div>

            {/* Payment */}
            <div
              style={{
                background: "#fff",
                borderRadius: "var(--radius-md)",
                padding: "0.5rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.625rem",
              }}
            >
              <Image
                src="/mp.svg"
                alt="Mercado Pago"
                width={40}
                height={40}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "var(--font-xs)",
                    fontWeight: 700,
                    color: "#263287",
                  }}
                >
                  Mercado Pago
                </p>
                <p style={{ fontSize: "0.625rem", color: "#666" }}>
                  Pago seguro
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.1875rem" }}>
                <svg width="28" height="18" viewBox="0 0 36 24" fill="none">
                  <rect width="36" height="24" rx="4" fill="#1a3d7c" />
                  <text
                    x="18"
                    y="15"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="system-ui"
                  >
                    VISA
                  </text>
                </svg>
                <svg width="28" height="18" viewBox="0 0 36 24" fill="none">
                  <rect width="36" height="24" rx="4" fill="#1a1a2e" />
                  <circle
                    cx="14"
                    cy="12"
                    r="7"
                    fill="#eb001b"
                    fillOpacity="0.9"
                  />
                  <circle
                    cx="22"
                    cy="12"
                    r="7"
                    fill="#f79e1b"
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: "0.625rem" }}>
              <label style={labelStyle}>Medio de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "transferencia" | "mercadopago",
                  )
                }
                style={selectStyle}
              >
                {event.mediosDePago.includes("mercadopago") && (
                  <option value="mercadopago">Mercado Pago</option>
                )}
                {event.mediosDePago.includes("transferencia") && (
                  <option value="transferencia">Transferencia</option>
                )}
              </select>
            </div>

            {/* Terms */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                cursor: "pointer",
                fontSize: "var(--font-xs)",
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{
                  width: "0.9375rem",
                  height: "0.9375rem",
                  flexShrink: 0,
                  accentColor: "var(--color-primary)",
                  cursor: "pointer",
                }}
              />
              <span>
                Acepto los{" "}
                <Link
                  href="/terminos-y-condiciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Terminos y Condiciones
                </Link>
              </span>
            </label>

            <div
              style={{
                marginBottom: "0.875rem",
                padding: "0.875rem 0.9375rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(93, 232, 160, 0.24)",
                background: "rgba(93, 232, 160, 0.08)",
                color: "var(--text-secondary)",
                fontSize: "var(--font-xs)",
                lineHeight: 1.6,
              }}
            >
              Cuando se acredite el pago, las entradas te van a llegar por
              email. Revisá tambien spam, promociones y las demas bandejas por
              si el mensaje entra filtrado.
            </div>

            {/* Submit */}
            <button
              className="btn-primary modal-submit-btn"
              disabled={!isFormValid || isSubmittingPurchase}
              onClick={async () => {
                if (!isFormValid) return;
                setPurchaseError(null);

                if (paymentMethod !== "mercadopago") {
                  setPurchaseError(
                    "La integracion real disponible en esta etapa es Mercado Pago.",
                  );
                  return;
                }

                setIsSubmittingPurchase(true);

                try {
                  const preference = await createCheckoutPreference({
                    eventoId: event.id,
                    cantidad: quantity,
                    buyer: {
                      nombre: firstName.trim(),
                      apellido: lastName.trim(),
                      email: email.trim(),
                      documento: dniNumber.trim(),
                      tipoDocumento: dniType,
                    },
                  });

                  writeStoredBuyerProfile({
                    nombre: firstName.trim(),
                    apellido: lastName.trim(),
                    email: email.trim(),
                    documento: dniNumber.trim(),
                    tipoDocumento: dniType,
                  });

                  window.location.assign(preference.checkoutUrl);
                  return;
                } catch (error) {
                  setPurchaseError(
                    error instanceof Error
                      ? error.message
                      : "No se pudo iniciar el checkout con Mercado Pago",
                  );
                } finally {
                  setIsSubmittingPurchase(false);
                }
              }}
              style={{
                width: "100%",
                background:
                  isFormValid && !isSubmittingPurchase
                    ? "var(--color-accent)"
                    : "var(--accent-35)",
                color: "var(--text-primary)",
                fontSize: "var(--font-sm)",
                fontWeight: 900,
                padding: "0.8125rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor:
                  isFormValid && !isSubmittingPurchase
                    ? "pointer"
                    : "not-allowed",
                opacity: isFormValid && !isSubmittingPurchase ? 1 : 0.6,
                marginTop: "auto",
              }}
            >
              {isSubmittingPurchase
                ? "Redirigiendo a Mercado Pago..."
                : `Pagar ${event.price > 0 ? formatArsVisual(total) : "— Gratis"}`}
            </button>

            {purchaseError ? (
              <p
                style={{
                  margin: "0.625rem 0 0",
                  fontSize: "var(--font-xs)",
                  color: "#ff8a8a",
                  lineHeight: 1.5,
                }}
              >
                {purchaseError}
              </p>
            ) : null}
          </div>
        </div>

        <style>{`
          .modal-content {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .modal-flyer-image {
            z-index: 2;
            object-fit: contain !important;
            object-position: center !important;
          }
          @media (max-width: 1024px) {
            .modal-overlay {
              align-items: flex-start !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch;
              padding: 16px 0 !important;
            }
            .modal-content {
              max-height: none !important;
              margin: 0 auto;
            }
            .modal-layout {
              flex-direction: column !important;
            }
            .modal-flyer {
              width: 100% !important;
              height: min(24rem, 56vh) !important;
              border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
            }
            .modal-form-col {
              width: 100% !important;
              padding: 0 24px 28px !important;
            }
          }
          @media (max-width: 640px) {
            .modal-overlay {
              padding: 8px 0 !important;
            }
            .modal-content {
              width: 100% !important;
              border-radius: var(--radius-lg) !important;
            }
            .modal-flyer {
              height: min(19rem, 46vh) !important;
              background: var(--bg-base) !important;
              border-radius: var(--radius-lg) var(--radius-lg) 0 0 !important;
            }
            .modal-flyer-image {
              object-fit: cover !important;
              object-position: center 20% !important;
              border-radius: inherit;
            }
            .modal-info-col {
              padding: 20px 16px !important;
            }
            .modal-form-col {
              padding: 0 16px 24px !important;
            }
            .modal-pricing-divider {
              margin-top: 0.75rem !important;
              margin-bottom: 0.5rem !important;
            }
            .modal-pricing-block {
              margin-bottom: 0.75rem !important;
            }
            .modal-submit-btn {
              margin-top: 0 !important;
            }
          }
          @media (max-width: 480px) {
            .modal-overlay {
              padding: 0 !important;
            }
            .modal-content {
              width: 100% !important;
              border-radius: var(--radius-md) var(--radius-md) 0 0 !important;
              min-height: 100vh;
            }
            .modal-flyer {
              height: min(16rem, 40vh) !important;
              border-radius: var(--radius-md) var(--radius-md) 0 0 !important;
            }
            .modal-info-col {
              padding: 16px 14px !important;
            }
            .modal-form-col {
              padding: 0 14px 20px !important;
            }
            .modal-form-row-dni {
              grid-template-columns: 1fr !important;
            }
            .modal-form-row-name {
              grid-template-columns: 1fr !important;
            }
            .modal-pricing-divider {
              margin-top: 0.625rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
