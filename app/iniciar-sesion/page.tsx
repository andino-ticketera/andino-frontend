"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EvaIcon from "@/components/EvaIcon";
import {
  hydrateSupabaseSessionAuth,
  loginAuth,
  registerAuth,
  requestPasswordResetAuth,
  startGoogleOAuthAuth,
} from "@/lib/auth-api";
import { getRedirectByRole, writeAuthSession } from "@/lib/auth-client";

type AuthMode = "login" | "register";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IniciarSesionPage() {
  const router = useRouter();
  const getRedirectFromQuery = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );

    if (!redirect || !redirect.startsWith("/")) {
      return null;
    }

    return redirect;
  }, []);

  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const title = mode === "login" ? "Iniciar sesión" : "Crear cuenta";

  const submitLabel = mode === "login" ? "Ingresar" : "Crear cuenta";

  const resetMessages = () => {
    setPendingMessage(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const onSwitchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetMessages();
  };

  useEffect(() => {
    let cancelled = false;

    const hasOAuthFragment =
      typeof window !== "undefined" &&
      (window.location.hash.includes("access_token") ||
        window.location.hash.includes("error"));

    if (!hasOAuthFragment) return;

    const syncOAuthSession = async () => {
      setIsSubmitting(true);
      setPendingMessage("Validando tu cuenta de Google...");

      try {
        const oauthResult = await hydrateSupabaseSessionAuth();
        if (!oauthResult || cancelled) return;

        writeAuthSession({
          user: oauthResult.user,
          loggedAt: new Date().toISOString(),
        });

        const redirectFromQuery = getRedirectFromQuery();
        const destination =
          redirectFromQuery && redirectFromQuery.startsWith("/")
            ? redirectFromQuery
            : getRedirectByRole(oauthResult.user.rol);

        setFormSuccess("Sesión iniciada con Google. Te redirigimos...");
        window.setTimeout(() => {
          if (!cancelled) {
            router.push(destination);
          }
        }, 500);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo completar el login con Google";
        setFormError(message);
      } finally {
        if (!cancelled) {
          setIsSubmitting(false);
          setPendingMessage(null);
        }
      }
    };

    void syncOAuthSession();

    return () => {
      cancelled = true;
    };
  }, [getRedirectFromQuery, router]);

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    resetMessages();
    setIsSubmitting(true);
    setPendingMessage("Redirigiendo a Google para iniciar sesión...");

    try {
      const redirectTo = `${window.location.origin}/iniciar-sesion${window.location.search}`;
      await startGoogleOAuthAuth({ redirectTo });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar con Google";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
      setPendingMessage(null);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setFormError("Ingresá un email válido para recuperar tu clave.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setPendingMessage("Enviando enlace de recuperación...");

    try {
      await requestPasswordResetAuth(normalizedEmail);
      setFormSuccess(
        "Si el email existe, te enviamos un enlace para restablecer tu clave.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo enviar el email de recuperación";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
      setPendingMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setFormError("Ingresá un email válido.");
      return;
    }

    if (password.trim().length < 6) {
      setFormError("La clave debe tener al menos 6 caracteres.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setPendingMessage(
      mode === "login"
        ? "Cargando información de tu cuenta..."
        : "Creando tu cuenta...",
    );

    try {
      if (mode === "register") {
        if (!fullName.trim()) {
          setFormError("Ingresa tu nombre completo.");
          return;
        }

        if (password !== confirmPassword) {
          setFormError("Las claves no coinciden.");
          return;
        }

        const registerResult = await registerAuth({
          nombreCompleto: fullName.trim(),
          email: normalizedEmail,
          password,
        });

        if (registerResult.requiresEmailVerification) {
          setFormSuccess(
            "Te enviamos un email para verificar tu cuenta. Confirma tu correo y luego iniciá sesión.",
          );
          setMode("login");
          return;
        }

        writeAuthSession({
          user: registerResult.user,
          loggedAt: new Date().toISOString(),
        });

        const redirectFromQuery = getRedirectFromQuery();
        const destination =
          redirectFromQuery && redirectFromQuery.startsWith("/")
            ? redirectFromQuery
            : getRedirectByRole(registerResult.user.rol);

        setFormSuccess("Cuenta creada. Te redirigimos...");

        window.setTimeout(() => {
          router.push(destination);
        }, 800);

        return;
      }

      const loginResult = await loginAuth({
        email: normalizedEmail,
        password,
      });

      writeAuthSession({
        user: loginResult.user,
        loggedAt: new Date().toISOString(),
      });

      const redirectFromQuery = getRedirectFromQuery();
      const destination =
        redirectFromQuery && redirectFromQuery.startsWith("/")
          ? redirectFromQuery
          : getRedirectByRole(loginResult.user.rol);

      setFormSuccess("Sesión iniciada. Te redirigimos...");

      window.setTimeout(() => {
        router.push(destination);
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in">
      <Navbar />
      <div style={{ height: "6.5rem" }} />

      <main
        className="auth-main"
        style={{
          minHeight: "calc(100vh - 6.5rem - 12.5rem)",
          padding: "2rem 1rem 1.25rem",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          alignItems: "center",
        }}
      >
        <div className="starfield-top" aria-hidden>
          <div className="star-layer star-layer-1" />
          <div className="star-layer star-layer-2" />
          <div className="star-layer star-layer-3" />
        </div>

        <section
          style={{
            width: "min(100%, 60rem)",
            margin: "0 auto",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, var(--bg-surface-1) 0%, var(--bg-surface-2) 100%)",
            boxShadow: "0 1.25rem 3.5rem rgba(16, 8, 26, 0.45)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="auth-layout" style={{ display: "grid" }}>
            <aside
              style={{
                padding: "1.25rem",
                borderBottom: "1px solid var(--border-color)",
                background:
                  "radial-gradient(circle at top left, rgba(92, 255, 157, 0.12), transparent 50%), var(--bg-surface-1)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--color-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  margin: "0 0 0.75rem",
                }}
              >
                Andino Tickets
              </p>

              <h1
                style={{
                  fontSize: "var(--font-2xl)",
                  lineHeight: "var(--leading-tight)",
                  margin: "0 0 0.5rem",
                }}
              >
                Entra y gestiona tus entradas en segundos
              </h1>

              <p
                style={{
                  margin: "0.875rem 0 0.25rem",
                  color: "var(--text-secondary)",
                  fontSize: "var(--font-sm)",
                  lineHeight: "1.6",
                  maxWidth: "30ch",
                }}
              >
                Crea tu cuenta para guardar eventos favoritos, seguir compras y
                pagar con mas rapidez.
              </p>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "grid",
                  gap: "0.875rem",
                }}
              >
                {[
                  {
                    label: "Compra segura con resumen claro",
                    icon: "flash",
                  },
                  {
                    label: "Historial de eventos en un solo lugar",
                    icon: "star",
                  },
                  {
                    label: "Acceso rapido desde cualquier dispositivo",
                    icon: "activity",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--text-secondary)",
                      fontSize: "var(--font-sm)",
                    }}
                  >
                    <span
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "var(--radius-full)",
                        display: "grid",
                        placeItems: "center",
                        background: "var(--primary-10)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--primary-25)",
                        flexShrink: 0,
                      }}
                    >
                      <EvaIcon name={item.icon} size={14} />
                    </span>
                    <span
                      style={{
                        lineHeight: "1.45",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            <div
              style={{
                padding: "1.25rem",
                background: "var(--bg-surface-1)",
                position: "relative",
              }}
            >
              {isSubmitting && pendingMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 3,
                    display: "grid",
                    placeItems: "center",
                    padding: "1.5rem",
                    background: "rgba(12, 8, 18, 0.78)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div
                    style={{
                      width: "min(100%, 24rem)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid rgba(92, 255, 157, 0.26)",
                      background:
                        "linear-gradient(180deg, rgba(35, 24, 49, 0.96), rgba(23, 15, 33, 0.98))",
                      boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.32)",
                      padding: "1.5rem 1.25rem",
                      display: "grid",
                      justifyItems: "center",
                      gap: "0.875rem",
                      textAlign: "center",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius-full)",
                        border: "3px solid rgba(92, 255, 157, 0.22)",
                        borderTopColor: "var(--color-primary)",
                        animation: "auth-spinner 0.8s linear infinite",
                        boxShadow: "0 0 0 0.375rem rgba(92, 255, 157, 0.08)",
                      }}
                    />

                    <div style={{ display: "grid", gap: "0.375rem" }}>
                      <strong
                        style={{
                          fontSize: "var(--font-lg)",
                          color: "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {pendingMessage}
                      </strong>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-sm)",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        Esto puede tardar unos segundos. No cierres esta
                        ventana.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface-2)",
                  padding: "0.25rem",
                  marginBottom: "1rem",
                  width: "100%",
                  maxWidth: "24rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => onSwitchMode("login")}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "0.5rem 0.875rem",
                    background:
                      mode === "login" ? "var(--bg-surface-3)" : "transparent",
                    color:
                      mode === "login"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchMode("register")}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "0.5rem 0.875rem",
                    background:
                      mode === "register"
                        ? "var(--bg-surface-3)"
                        : "transparent",
                    color:
                      mode === "register"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                  }}
                >
                  Crear cuenta
                </button>
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--font-xl)",
                }}
              >
                {title}
              </h2>

              <p
                style={{
                  margin: "0.5rem 0 1rem",
                  color: "var(--text-secondary)",
                  fontSize: "var(--font-sm)",
                }}
              >
                {mode === "login"
                  ? "Ingresa con tus credenciales para continuar."
                  : "Registra tu email y una clave para empezar."}
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="google-auth-button"
                style={{
                  width: "100%",
                  border: "1px solid rgba(31, 31, 31, 0.32)",
                  borderRadius: "999px",
                  background: "#ffffff",
                  color: "#1f1f1f",
                  padding: "0.9rem 1.25rem",
                  fontWeight: 500,
                  fontSize: "var(--font-base)",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  opacity: isSubmitting ? 0.8 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.7rem",
                  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.08)",
                  transition:
                    "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden
                  focusable="false"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    fill="#EA4335"
                    d="M9 7.364v3.49h4.848c-.213 1.122-.852 2.073-1.81 2.712l2.927 2.27C16.671 14.263 17.636 11.947 17.636 9c0-.56-.05-1.097-.146-1.636H9z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.455 0 4.513-.813 6.017-2.164l-2.927-2.27c-.813.546-1.852.868-3.09.868-2.37 0-4.38-1.6-5.097-3.75H.878v2.356A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M3.903 10.684A5.41 5.41 0 0 1 3.619 9c0-.586.102-1.153.284-1.684V4.96H.878A8.996 8.996 0 0 0 0 9c0 1.455.348 2.833.878 4.04l3.025-2.356z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M9 3.579c1.335 0 2.535.46 3.476 1.364l2.607-2.606C13.508.892 11.455 0 9 0A9 9 0 0 0 .878 4.96l3.025 2.356C4.62 5.18 6.63 3.579 9 3.579z"
                  />
                </svg>
                <span>
                  {mode === "register"
                    ? "Registrarse con Google"
                    : "Continuar con Google"}
                </span>
              </button>

              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    height: "1px",
                    background: "var(--border-color)",
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--font-xs)",
                    color: "var(--text-disabled)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  o con email
                </span>
                <span
                  style={{
                    height: "1px",
                    background: "var(--border-color)",
                    opacity: 0.8,
                  }}
                />
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gap: "0.75rem" }}
              >
                {mode === "register" && (
                  <label style={{ display: "grid", gap: "0.375rem" }}>
                    <span
                      style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      Nombre completo
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      placeholder="Ej. Maria Gomez"
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
                )}

                <label style={{ display: "grid", gap: "0.375rem" }}>
                  <span
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="nombre@correo.com"
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
                    Clave
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
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

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-primary)",
                      textAlign: "left",
                      fontSize: "var(--font-sm)",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Olvide mi clave
                  </button>
                )}

                {mode === "register" && (
                  <label style={{ display: "grid", gap: "0.375rem" }}>
                    <span
                      style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      Repite tu clave
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
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
                )}

                {formError && (
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
                    {formError}
                  </p>
                )}

                {formSuccess && (
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
                    {formSuccess}
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
                  {isSubmitting ? "Procesando..." : submitLabel}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .auth-main {
          justify-items: center;
        }

        .auth-layout {
          grid-template-columns: 1fr;
        }

        @media (min-width: 56.25rem) {
          .auth-layout {
            grid-template-columns: 1fr 1fr;
          }

          .auth-layout > aside {
            border-right: 1px solid var(--border-color);
            border-bottom: none !important;
            padding: 2.25rem !important;
          }

          .auth-layout > div {
            padding: 2.25rem !important;
          }
        }

        .google-auth-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #f8f9fa !important;
          border-color: rgba(31, 31, 31, 0.46) !important;
          box-shadow: 0 2px 8px rgba(16, 24, 40, 0.12);
        }

        .google-auth-button:disabled {
          cursor: wait !important;
          background: #f3f4f6 !important;
        }

        @keyframes auth-spinner {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
