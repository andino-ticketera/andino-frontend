"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import EvaIcon from "./EvaIcon";

interface LogoutConfirmDialogProps {
  open: boolean;
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmDialog({
  open,
  isLoggingOut,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  const [mounted] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoggingOut) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoggingOut, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
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
            id="logout-confirm-title"
            style={{ fontSize: "var(--font-base)", fontWeight: 700 }}
          >
            Confirmar cierre de sesión
          </strong>
        </div>

        <div style={{ display: "grid", gap: "0.625rem" }}>
          <button
            type="button"
            onClick={onConfirm}
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
            onClick={onCancel}
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
  );
}

