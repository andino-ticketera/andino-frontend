"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Logo from "@/components/Logo";
import EvaIcon from "@/components/EvaIcon";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import { useMenuToggle } from "@/hooks/useMenuToggle";
import { clearAuthSession } from "@/lib/auth-client";
import { logoutAuth } from "@/lib/auth-api";

const navItems = [
  { href: "/admin", label: "Panel", icon: "grid" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "person" },
  { href: "/admin/carrusel", label: "Carrusel", icon: "activity" },
  { href: "/admin/categorias", label: "Categorías", icon: "star" },
  { href: "/admin/eventos/nuevo", label: "Crear evento", icon: "plus" },
  { href: "/admin/eventos", label: "Eventos", icon: "calendar" },
  { href: "/admin/compradores", label: "Compradores", icon: "shopping-cart" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, setIsOpen } = useMenuToggle();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const requestLogout = useCallback(() => {
    if (isLoggingOut) return;
    setLogoutConfirmOpen(true);
    setIsOpen(false);
  }, [isLoggingOut, setIsOpen]);

  const cancelLogout = useCallback(() => {
    if (isLoggingOut) return;
    setLogoutConfirmOpen(false);
  }, [isLoggingOut]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutAuth();
    } finally {
      clearAuthSession();
      setIsOpen(false);
      setLogoutConfirmOpen(false);
      setIsLoggingOut(false);
      router.push("/");
    }
  }, [isLoggingOut, router, setIsOpen]);

  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/eventos/nuevo")
      return pathname === "/admin/eventos/nuevo";
    if (href === "/admin/eventos") {
      return (
        pathname === "/admin/eventos" ||
        (/^\/admin\/eventos\/[^/]+$/.test(pathname) &&
          pathname !== "/admin/eventos/nuevo")
      );
    }
    return pathname === href;
  };

  return (
    <>
      {/* Header móvil con logo y hamburguesa */}
      <header
        className="mobile-header"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "var(--bg-surface-1)",
          borderBottom: "1px solid var(--border-color)",
          zIndex: 49,
          padding: "0.75rem 1rem",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "60px" }}>
          <Logo size="sm" />
        </div>

        <button
          className="menu-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "0.625rem",
            cursor: "pointer",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease-out",
          }}
          aria-label="Toggle menu"
        >
          <EvaIcon name={isOpen ? "close" : "menu"} size={24} />
        </button>
      </header>

      {/* Overlay (solo cuando el menú está abierto en móvil) */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 39,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: "260px",
          background: "var(--bg-surface-1)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.25rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <Logo size="sm" />
        </div>

        <nav
          style={{
            padding: "1.125rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="menu-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--text-secondary)",
                  background: isActive ? "var(--primary-10)" : "transparent",
                  border: isActive
                    ? "1px solid var(--primary-25)"
                    : "1px solid transparent",
                  fontSize: "var(--font-sm)",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.2s ease-out",
                }}
              >
                <EvaIcon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "1rem 0.75rem",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <Link
            href="/"
            className="menu-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              transition: "all 0.2s ease-out",
            }}
          >
            <EvaIcon name="arrow-back" size={18} />
            <span>Volver al sitio</span>
          </Link>
          <button
            type="button"
            onClick={requestLogout}
            disabled={isLoggingOut}
            className="menu-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              border: "1px solid transparent",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              cursor: isLoggingOut ? "wait" : "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.2s ease-out",
              opacity: isLoggingOut ? 0.6 : 1,
            }}
          >
            <EvaIcon name="log-out-outline" size={18} />
            <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </button>
        </div>
      </aside>

      {/* Estilos responsivos */}
      <style>{`
        /* Desktop: mostrar sidebar normal, header oculto */
        @media (min-width: 769px) {
          .mobile-header {
            display: none !important;
          }

          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
        }

        /* Mobile: mostrar header y drawer */
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }

          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100vh;
            top: 60px;
            margin-top: 0;
          }

          ${isOpen ? `.dashboard-sidebar { transform: translateX(0) !important; }` : ""}
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <LogoutConfirmDialog
        open={logoutConfirmOpen}
        isLoggingOut={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}

