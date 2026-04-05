"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { updatePasswordAuth } from "@/lib/auth-api";

export default function RestablecerClavePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.trim().length < 6) {
      setError("La clave debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las claves no coinciden.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updatePasswordAuth(password);
      setSuccess("Clave actualizada correctamente. Redirigiendo al login...");
      window.setTimeout(() => {
        router.push("/iniciar-sesion");
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la clave. Solicita un nuevo enlace.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in">
      <Navbar />
      <div style={{ height: "6.5rem" }} />

      <main
        style={{
          minHeight: "calc(100vh - 6.5rem - 12.5rem)",
          padding: "2rem 1rem 1.25rem",
          display: "grid",
          alignItems: "center",
        }}
      >
        <section
          style={{
            width: "min(100%, 32rem)",
            margin: "0 auto",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            background:
              "linear-gradient(135deg, var(--bg-surface-1) 0%, var(--bg-surface-2) 100%)",
            boxShadow: "0 1.25rem 3.5rem rgba(16, 8, 26, 0.45)",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "var(--font-xl)" }}>
            Restablecer clave
          </h1>
          <p
            style={{
              margin: "0.5rem 0 1rem",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
            }}
          >
            Ingresa tu nueva clave para recuperar el acceso a tu cuenta.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <label style={{ display: "grid", gap: "0.375rem" }}>
              <span
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                Nueva clave
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Minimo 6 caracteres"
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface-2)",
                  color: "var(--text-primary)",
                  padding: "0.75rem 0.875rem",
                  fontSize: "var(--font-base)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.375rem" }}>
              <span
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                Repite la nueva clave
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repite la clave"
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface-2)",
                  color: "var(--text-primary)",
                  padding: "0.75rem 0.875rem",
                  fontSize: "var(--font-base)",
                }}
              />
            </label>

            {error && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  padding: "0.625rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 107, 107, 0.45)",
                  background: "rgba(255, 107, 107, 0.1)",
                  color: "#ffd0d0",
                  fontSize: "var(--font-sm)",
                }}
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                style={{
                  margin: 0,
                  padding: "0.625rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--primary-35)",
                  background: "var(--primary-10)",
                  color: "var(--text-primary)",
                  fontSize: "var(--font-sm)",
                }}
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{
                marginTop: "0.25rem",
                border: "none",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)",
                color: "var(--text-primary)",
                padding: "0.875rem 1rem",
                fontWeight: 700,
                fontSize: "var(--font-base)",
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar clave"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
