"use client";

import { useState, ReactNode } from "react";
import EvaIcon from "./EvaIcon";

interface ExpandableTableRowProps {
  summary: {
    label: string;
    value: string | ReactNode;
  }[];
  details: {
    label: string;
    value: string | ReactNode;
  }[];
  actions?: ReactNode;
}

export default function ExpandableTableRow({
  summary,
  details,
  actions,
}: ExpandableTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        marginBottom: "0.75rem",
        background: "var(--bg-surface-1)",
        overflow: "hidden",
      }}
    >
      {/* Summary Row - clickeable para expandir */}
      <button
        className="expandable-row-summary"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "1rem",
          alignItems: "center",
          padding: "1rem",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-surface-2)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Icono expandir/contraer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--color-primary)",
            transition: "transform 0.2s ease",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <EvaIcon name="chevron-right" size={20} />
        </div>

        {/* Summary info */}
        <div
          className="expandable-row-summary-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
          }}
        >
          {summary.map((item, i) => (
            <div key={i}>
              <p
                className="expandable-row-label"
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--text-disabled)",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                {item.label}
              </p>
              {typeof item.value === "string" ? (
                <p
                  className="expandable-row-value"
                  style={{
                    fontSize: "var(--font-sm)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.value}
                </p>
              ) : (
                <div
                  className="expandable-row-value"
                  style={{
                    fontSize: "var(--font-sm)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.value}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Placeholder para acciones (oculto en summary) */}
        <div style={{ width: "80px" }} />
      </button>

      {/* Detalles expandidos */}
      {isExpanded && (
        <div
          className="expandable-row-details"
          style={{
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-surface-2)",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1.5rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {details.map((item, i) => (
            <div key={i}>
              <p
                className="expandable-row-label"
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--text-disabled)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                {item.label}
              </p>
              {typeof item.value === "string" ? (
                <p
                  className="expandable-row-value expandable-row-value-secondary"
                  style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--text-secondary)",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </p>
              ) : (
                <div
                  className="expandable-row-value expandable-row-value-secondary"
                  style={{
                    fontSize: "var(--font-sm)",
                    color: "var(--text-secondary)",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </div>
              )}
            </div>
          ))}

          {/* Acciones al final */}
          {actions && (
            <div
              className="expandable-row-actions"
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        @media (max-width: 768px) {
          .expandable-row-summary {
            gap: 0.625rem !important;
            padding: 0.75rem !important;
          }

          .expandable-row-summary-grid {
            gap: 0.625rem !important;
            grid-template-columns: repeat(auto-fit, minmax(95px, 1fr)) !important;
          }

          .expandable-row-details {
            padding: 0.75rem !important;
            gap: 0.875rem !important;
            grid-template-columns: repeat(auto-fit, minmax(125px, 1fr)) !important;
          }

          .expandable-row-label {
            font-size: 0.6875rem !important;
            margin-bottom: 0.1875rem !important;
          }

          .expandable-row-value {
            font-size: 0.75rem !important;
            line-height: 1.25 !important;
          }

          .expandable-row-value-secondary {
            font-size: 0.75rem !important;
          }

          .expandable-row-actions {
            gap: 0.5rem !important;
            padding-top: 0.625rem !important;
          }

          .expandable-row-actions a,
          .expandable-row-actions button {
            padding: 0.3125rem 0.5rem !important;
            font-size: 0.6875rem !important;
            gap: 0.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .expandable-row-summary {
            padding: 0.625rem !important;
          }

          .expandable-row-details {
            padding: 0.625rem !important;
          }

          .expandable-row-summary-grid {
            grid-template-columns: repeat(auto-fit, minmax(86px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}
