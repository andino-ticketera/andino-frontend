"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import EvaIcon from "./EvaIcon";
import Logo from "./Logo";
import {
  clearAuthSession,
  getRedirectByRole,
  readAuthSession,
  writeAuthSession,
  type AuthSession,
} from "@/lib/auth-client";
import { logoutAuth } from "@/lib/auth-api";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutToastOpen, setLogoutToastOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const pathname = usePathname();

  const panelHref = session ? getRedirectByRole(session.user.rol) : null;
  const canShowOrganizerCta =
    !session ||
    (session.user.rol !== "ORGANIZADOR" && session.user.rol !== "ADMIN");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsClient(true);
    setSession(readAuthSession());
  }, []);

  useEffect(() => {
    const syncSessionFromServer = async () => {
      try {
        const response = await fetch("/api/session/me", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthSession();
            setSession(null);
          }
          return;
        }

        const payload = (await response.json()) as {
          user?: AuthSession["user"];
        };

        if (!payload?.user?.rol) return;

        const nextSession: AuthSession = {
          user: payload.user,
          loggedAt: new Date().toISOString(),
        };

        writeAuthSession(nextSession);
        setSession(nextSession);
      } catch {
        // Ignore sync errors and keep local session fallback.
      }
    };

    void syncSessionFromServer();

    const onStorage = () => {
      const nextSession = readAuthSession();
      setSession(nextSession);

      if (!nextSession) {
        setLogoutToastOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!logoutToastOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLogoutToastOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logoutToastOpen]);

  const requestLogoutConfirmation = useCallback(() => {
    if (isLoggingOut || !session) return;
    setLogoutToastOpen(true);
    setMobileOpen(false);
  }, [isLoggingOut, session]);

  const cancelLogoutConfirmation = useCallback(() => {
    if (isLoggingOut) return;
    setLogoutToastOpen(false);
  }, [isLoggingOut]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutAuth();
    } finally {
      clearAuthSession();
      setSession(null);
      setMobileOpen(false);
      setLogoutToastOpen(false);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return pathname === "/";
      return pathname.startsWith(path);
    },
    [pathname],
  );

  return (
    <nav
      className={scrolled ? "navbar-scrolled" : ""}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? "var(--bg-base-97)" : "var(--bg-base-85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color-50)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size="md" />
        </Link>

        {/* Desktop Nav - floating pill container */}
        <div
          className="desktop-nav"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-full)",
            padding: "0.375rem 0.5rem",
          }}
        >
          {[
            { href: "/", label: "Cartelera" },
            { href: "/explorar", label: "Explorar" },
            { href: "/contacto", label: "Contacto" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive(href) ? " active" : ""}`}
              style={{
                color: isActive(href)
                  ? "var(--text-primary)"
                  : "var(--text-disabled)",
                fontSize: "var(--font-sm)",
                fontWeight: isActive(href) ? 600 : 500,
                textDecoration: "none",
                padding: "0.5rem 1.125rem",
                borderRadius: "var(--radius-full)",
                transition: "color 0.2s ease",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          className="desktop-nav"
        >
          {session ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
              }}
            >
              {panelHref && panelHref !== "/" && (
                <Link
                  href={panelHref}
                  style={{
                    color: "var(--color-primary)",
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition:
                      "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease",
                    padding: "0.625rem 1rem",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--primary-25)",
                    background: "var(--primary-10)",
                    boxShadow: "0 0.5rem 1.5rem rgba(92, 255, 157, 0.08)",
                  }}
                >
                  Mi panel
                </Link>
              )}
              <button
                type="button"
                onClick={requestLogoutConfirmation}
                style={{
                  color: "var(--text-disabled)",
                  fontSize: "var(--font-sm)",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href="/iniciar-sesion"
              style={{
                color: "var(--text-disabled)",
                fontSize: "var(--font-sm)",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              Iniciar Sesión
            </Link>
          )}
          {canShowOrganizerCta ? (
            <Link
              href="/organizador"
              className="btn-primary"
              style={{
                background: "var(--color-accent)",
                color: "var(--text-primary)",
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                padding: "0.6875rem 1.5rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Quiero ser Organizador
            </Link>
          ) : null}
        </div>

        {/* Mobile menu button */}
        <button
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            padding: "0.5rem",
            cursor: "pointer",
          }}
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <EvaIcon name={mobileOpen ? "close" : "menu"} size={24} />
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {mobileOpen && (
        <div
          style={{
            padding: "1.25rem 1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.125rem",
            borderTop: "1px solid var(--border-color-50)",
            background: "var(--bg-base-98)",
            animation: "heroFadeUp 0.2s ease-out both",
          }}
        >
          {[
            { href: "/", label: "Cartelera" },
            { href: "/explorar", label: "Explorar" },
            { href: "/contacto", label: "Contacto" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: isActive(href)
                  ? "var(--color-primary)"
                  : "var(--text-disabled)",
                fontSize: "var(--font-base)",
                fontWeight: isActive(href) ? 600 : 500,
                textDecoration: "none",
                padding: "0.125rem 0",
              }}
            >
              {label}
            </Link>
          ))}
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border-color)",
            }}
          />
          <div
            style={{
              display: "grid",
              gap: "1.125rem",
            }}
          >
            {!session && (
              <Link
                href="/iniciar-sesion"
                style={{
                  color: "var(--text-disabled)",
                  fontSize: "var(--font-base)",
                  textAlign: "left",
                  textDecoration: "none",
                  padding: "0.125rem 0",
                }}
              >
                Iniciar Sesión
              </Link>
            )}
            {session && panelHref && panelHref !== "/" && (
              <Link
                href={panelHref}
                style={{
                  color: "var(--text-disabled)",
                  fontSize: "var(--font-base)",
                  fontWeight: 500,
                  textAlign: "left",
                  textDecoration: "none",
                  padding: "0.125rem 0",
                }}
              >
                Mi panel
              </Link>
            )}
            {session && (
              <button
                type="button"
                onClick={requestLogoutConfirmation}
                style={{
                  color: "var(--text-disabled)",
                  fontSize: "var(--font-base)",
                  textAlign: "left",
                  textDecoration: "none",
                  background: "transparent",
                  border: "none",
                  padding: "0.125rem 0",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Cerrar sesión
              </button>
            )}
          </div>
          {canShowOrganizerCta ? (
            <Link
              href="/organizador"
              className="btn-primary"
              style={{
                background: "var(--color-accent)",
                color: "var(--text-primary)",
                fontSize: "var(--font-base)",
                fontWeight: 700,
                padding: "0.875rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textDecoration: "none",
                display: "block",
                textAlign: "center",
              }}
            >
              Quiero ser Organizador
            </Link>
          ) : null}
        </div>
      )}

      {isClient && logoutToastOpen && session
        ? createPortal(
            <div
              className="logout-toast-overlay"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding:
                  "max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))",
                background: "rgba(14, 6, 24, 0.56)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="logout-toast"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="logout-toast-title"
                style={{
                  width: "min(100%, 28rem)",
                  borderRadius: "1.25rem",
                  border: "1px solid var(--border-color)",
                  background: "rgba(35, 18, 56, 0.96)",
                  color: "var(--text-primary)",
                  padding: "1rem",
                  boxShadow: "0 1.2rem 3rem rgba(0, 0, 0, 0.38)",
                  display: "grid",
                  gap: "0.875rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 79, 220, 0.14)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <EvaIcon name="log-out-outline" size={18} />
                    </span>
                    <strong
                      id="logout-toast-title"
                      style={{ fontSize: "var(--font-base)", fontWeight: 700 }}
                    >
                      Confirmar cierre de sesión
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "0.625rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{
                      width: "100%",
                      minHeight: "2.875rem",
                      borderRadius: "999px",
                      border: "none",
                      background: "var(--color-accent)",
                      color: "var(--text-primary)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                      padding: "0.75rem 1rem",
                      cursor: isLoggingOut ? "wait" : "pointer",
                      opacity: isLoggingOut ? 0.75 : 1,
                    }}
                  >
                    {isLoggingOut ? "Cerrando sesión..." : "Sí, cerrar sesión"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelLogoutConfirmation}
                    disabled={isLoggingOut}
                    style={{
                      width: "100%",
                      minHeight: "2.875rem",
                      borderRadius: "999px",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "var(--text-secondary)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 600,
                      padding: "0.75rem 1rem",
                      cursor: isLoggingOut ? "not-allowed" : "pointer",
                      opacity: isLoggingOut ? 0.6 : 1,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }

      `}</style>
    </nav>
  );
}


