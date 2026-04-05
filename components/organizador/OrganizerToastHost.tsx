"use client";

import EvaIcon from "@/components/EvaIcon";
import { useOrganizer } from "@/context/OrganizerContext";

export default function OrganizerToastHost() {
  const { toast, clearToast } = useOrganizer();

  if (!toast) return null;

  const isDanger = toast.type === "danger";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 120,
        minWidth: "280px",
        maxWidth: "420px",
        borderRadius: "var(--radius-md)",
        padding: "0.75rem 0.875rem",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        border: isDanger
          ? "1px solid rgba(255, 80, 80, 0.45)"
          : "1px solid rgba(92, 255, 157, 0.45)",
        background: isDanger
          ? "rgba(90, 20, 28, 0.92)"
          : "rgba(16, 71, 45, 0.92)",
        color: "#ffffff",
        boxShadow: "0 10px 28px rgba(0, 0, 0, 0.32)",
        backdropFilter: "blur(6px)",
      }}
      role="status"
      aria-live="polite"
    >
      <EvaIcon name={isDanger ? "trash" : "checkmark"} size={16} />
      <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, flex: 1 }}>
        {toast.message}
      </span>
      <button
        type="button"
        onClick={clearToast}
        aria-label="Cerrar notificacion"
        style={{
          border: "none",
          background: "transparent",
          color: "#ffffff",
          cursor: "pointer",
          width: "1.5rem",
          height: "1.5rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EvaIcon name="close" size={16} />
      </button>
    </div>
  );
}
