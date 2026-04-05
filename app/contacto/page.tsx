"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EvaIcon from "@/components/EvaIcon";

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    setSubmitted(true);
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
            padding: "2.5rem 1.5rem",
          }}
        >
          <div
            style={{
              background: "#351a52",
              borderRadius: "1rem",
              padding: "3.75rem 2.5rem",
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
                margin: "0 auto 1.25rem",
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
              Mensaje enviado
            </h2>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#a78bba",
                lineHeight: 1.6,
              }}
            >
              Gracias por contactarnos. Te responderemos a la brevedad.
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
          padding: "2.5rem 1.5rem",
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
            boxShadow: "0 1rem 3rem rgba(0,0,0,0.3)",
          }}
          className="contact-form"
        >
          <h1
            style={{
              fontSize: "clamp(1.375rem, 4vw, 1.75rem)",
              fontWeight: 900,
              color: "#5de8a0",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Contacto
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#a78bba",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Tenes alguna consulta? Escribinos y te respondemos.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            {/* Nombre */}
            <div style={fieldStyle}>
              <label htmlFor="contacto-nombre" style={labelTextStyle}>
                Nombre
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="contacto-nombre"
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

            {/* Email */}
            <div style={fieldStyle}>
              <label htmlFor="contacto-email" style={labelTextStyle}>
                Correo electronico
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="contacto-email"
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

            {/* Asunto */}
            <div style={fieldStyle}>
              <label htmlFor="contacto-asunto" style={labelTextStyle}>
                Asunto
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="contacto-asunto"
                  type="text"
                  placeholder="Motivo de tu consulta"
                  value={form.asunto}
                  onChange={(e) => update("asunto", e.target.value)}
                  style={inputStyle}
                />
                <span style={iconWrapStyle}>
                  <EvaIcon name="star" size={20} />
                </span>
              </div>
            </div>

            {/* Mensaje */}
            <div style={fieldStyle}>
              <label htmlFor="contacto-mensaje" style={labelTextStyle}>
                Mensaje
              </label>
              <textarea
                id="contacto-mensaje"
                placeholder="Escribi tu mensaje..."
                value={form.mensaje}
                onChange={(e) => update("mensaje", e.target.value)}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  paddingRight: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                fontSize: "0.9375rem",
                fontWeight: 700,
                padding: "0.875rem 3rem",
                borderRadius: "0.625rem",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .contact-form input::placeholder,
        .contact-form textarea::placeholder {
          color: #6b5a7e;
        }
        .contact-form input:focus,
        .contact-form textarea:focus {
          border-color: #5de8a0 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(118, 255, 165, 0.12);
          background: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 640px) {
          .contact-form {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
