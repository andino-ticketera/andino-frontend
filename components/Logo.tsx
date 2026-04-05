interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  layout?: "vertical" | "horizontal";
}

const sizes = {
  sm: { andino: "24px", subtitle: "10px", gap: "2px" },
  md: { andino: "32px", subtitle: "13px", gap: "2px" },
  lg: { andino: "48px", subtitle: "16px", gap: "4px" },
};

export default function Logo({ size = "md", showSubtitle = true, layout = "vertical" }: LogoProps) {
  const s = sizes[size];
  const isHorizontal = layout === "horizontal";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: isHorizontal ? "baseline" : "flex-start",
        gap: isHorizontal ? "8px" : s.gap,
        lineHeight: 1.1,
      }}
    >
      <span
        style={{
          fontSize: s.andino,
          fontWeight: 900,
          fontStyle: "italic",
          color: "var(--color-primary)",
          textShadow: "3px 3px 0px var(--color-accent), 1px 1px 0px rgba(0,0,0,0.3)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Andino
      </span>
      {showSubtitle && (
        <span
          style={{
            fontSize: isHorizontal ? "14px" : s.subtitle,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          Eventos culturales
        </span>
      )}
    </div>
  );
}
