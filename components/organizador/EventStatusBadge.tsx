const badgeColors = {
  pendiente: {
    background: "rgba(255, 193, 7, 0.15)",
    border: "1px solid rgba(255, 193, 7, 0.4)",
    color: "#ffd54f",
    label: "Pendiente",
  },
  aprobado: {
    background: "rgba(92, 255, 157, 0.12)",
    border: "1px solid rgba(92, 255, 157, 0.35)",
    color: "var(--color-primary)",
    label: "Aprobado",
  },
  rechazado: {
    background: "rgba(255, 80, 80, 0.12)",
    border: "1px solid rgba(255, 80, 80, 0.35)",
    color: "#ff6b6b",
    label: "Rechazado",
  },
} as const;

export default function EventStatusBadge({
  estado,
}: {
  estado?: "pendiente" | "aprobado" | "rechazado";
}) {
  const config = badgeColors[estado ?? "aprobado"];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--font-xs)",
        fontWeight: 700,
        background: config.background,
        border: config.border,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
