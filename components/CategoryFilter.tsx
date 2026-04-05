"use client";

import EvaIcon from "./EvaIcon";

const categoryIcons: Record<string, string> = {
  "Todos los Eventos": "search",
  "Musica en Vivo": "music",
  "Fiestas": "flash",
  "Teatro": "film",
  "Danza": "activity",
  "Recreacion": "sun",
  "Eventos Especiales": "star",
};

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="hide-scrollbar category-scroll" style={{ width: "100%", overflowX: "auto", padding: "0.5rem 0" }}>
      <div style={{ display: "flex", gap: "0.625rem", minWidth: "max-content" }}>
        {categories.map((cat) => {
          const isActive = cat === selected;
          const iconName = categoryIcons[cat] || "search";
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`category-pill ${isActive ? "active" : ""}`}
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: isActive ? 600 : 500,
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-full)",
                whiteSpace: "nowrap",
                cursor: "pointer",
                background: isActive ? "var(--primary-15)" : "transparent",
                color: isActive ? "var(--color-primary)" : "var(--text-disabled)",
                border: isActive
                  ? "1px solid var(--primary-50)"
                  : "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <EvaIcon name={iconName} size={16} />
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
