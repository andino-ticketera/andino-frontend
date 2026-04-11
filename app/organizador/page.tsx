"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EvaIcon from "@/components/EvaIcon";
import { sendOrganizerLead } from "@/lib/organizer-contact-api";

export default function OrganizadorPage() {
  const [form, setForm] = useState({
    pais: "Argentina",
    nombre: "",
    apellido: "",
    empresa: "",
    email: "",
    telefono: "+549",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await sendOrganizerLead(form);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la solicitud",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 3rem 1rem 1rem",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1.5px solid #4a2d6b",
    borderRadius: "0.625rem",
    outline: "none",
    transition: "border-color 0.2s ease, background 0.2s ease",
  };

  const iconWrapStyle: React.CSSProperties = {
    position: "absolute",
    right: "0.875rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a78bba",
    pointerEvents: "none",
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  };

  const labelTextStyle: React.CSSProperties = {
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#a78bba",
    paddingLeft: "0.125rem",
  };

  if (submitted) {
    return (
      <div className="page-fade-in">
        <Navbar />
        <div style={{ height: "80px" }} />
        <div
          style={{
            minHeight: "calc(100vh - 80px - 200px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
          }}
        >
          <div
            style={{
              background: "#351a52",
              borderRadius: "1rem",
              padding: "60px 40px",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
              border: "1px solid #4a2d6b",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                background: "rgba(118,255,165,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "#5de8a0",
                fontSize: "2rem",
              }}
            >
              &#10003;
            </div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#5de8a0",
                marginBottom: "0.75rem",
              }}
            >
              Formulario enviado
            </h2>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#a78bba",
                lineHeight: 1.6,
              }}
            >
              Gracias por tu interés. Un asesor se pondrá en contacto contigo a
              la brevedad para ayudarte a crear tu evento.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-fade-in">
      <Navbar />
      <div style={{ height: "80px" }} />

      <div
        style={{
          minHeight: "calc(100vh - 80px - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            background: "#351a52",
            borderRadius: "1rem",
            padding: "2.5rem",
            maxWidth: "560px",
            width: "100%",
            border: "1px solid #4a2d6b",
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}
          className="organizer-form"
        >
          {/* Header */}
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 900,
              color: "#5de8a0",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Quiero ser Organizador
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#a78bba",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Completa tus datos y un asesor te contactará para ayudarte a crear
            tu evento.
          </p>

          {/* Form fields */}
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            {/* País */}
            <div style={fieldStyle}>
              <label htmlFor="org-pais" style={labelTextStyle}>
                País
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-pais"
                  type="text"
                  value={form.pais}
                  onChange={(e) => update("pais", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Nombre */}
            <div style={fieldStyle}>
              <label htmlFor="org-nombre" style={labelTextStyle}>
                Nombre
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <EvaIcon name="person" size={20} />
                </span>
              </div>
            </div>

            {/* Apellido */}
            <div style={fieldStyle}>
              <label htmlFor="org-apellido" style={labelTextStyle}>
                Apellido
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-apellido"
                  type="text"
                  placeholder="Tu apellido"
                  value={form.apellido}
                  onChange={(e) => update("apellido", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <EvaIcon name="person" size={20} />
                </span>
              </div>
            </div>

            {/* Empresa */}
            <div style={fieldStyle}>
              <label htmlFor="org-empresa" style={labelTextStyle}>
                Empresa / Productora
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-empresa"
                  type="text"
                  placeholder="Nombre de tu empresa o productora"
                  value={form.empresa}
                  onChange={(e) => update("empresa", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM5 5h14a1 1 0 0 1 1 1v2H4V6a1 1 0 0 1 1-1zM4 18v-8h16v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm4-6h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H8zm4 0h2v2h-2z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={fieldStyle}>
              <label htmlFor="org-email" style={labelTextStyle}>
                Correo electrónico
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <EvaIcon name="email" size={20} />
                </span>
              </div>
            </div>

            {/* Teléfono */}
            <div style={fieldStyle}>
              <label htmlFor="org-telefono" style={labelTextStyle}>
                Teléfono
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="org-telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.4 22A15.42 15.42 0 0 1 2 6.6 4.6 4.6 0 0 1 6.6 2a3.94 3.94 0 0 1 .77.07 3.79 3.79 0 0 1 .72.18 1 1 0 0 1 .65.75l1.37 6a1 1 0 0 1-.26.92c-.13.14-.14.15-1.37.79a9.91 9.91 0 0 0 4.87 4.89c.65-1.24.66-1.25.8-1.38a1 1 0 0 1 .92-.26l6 1.37a1 1 0 0 1 .72.65 3.79 3.79 0 0 1 .18.72 4.15 4.15 0 0 1 .07.77A4.6 4.6 0 0 1 17.4 22z" />
                  </svg>
                </span>
              </div>
            </div>

            {submitError ? (
              <p
                role="alert"
                style={{
                  margin: "0.25rem 0 0",
                  padding: "0.875rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255, 143, 143, 0.35)",
                  background: "rgba(255, 143, 143, 0.08)",
                  color: "#ffd0d0",
                  fontSize: "0.875rem",
                }}
              >
                {submitError}
              </p>
            ) : null}

            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  background: "var(--color-accent)",
                  color: "#fff",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  padding: "0.875rem 3rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  cursor: isSubmitting ? "wait" : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />

      <style>{`
        .organizer-form input::placeholder {
          color: #6b5a7e;
        }
        .organizer-form input:focus {
          border-color: #5de8a0 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(118, 255, 165, 0.12);
          background: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 640px) {
          .organizer-form {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

