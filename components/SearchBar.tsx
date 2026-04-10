"use client";

import { useState, useMemo } from "react";
import EvaIcon from "./EvaIcon";
import { provincias, localidades } from "@/data/locations";

interface SearchBarProps {
  onSearch?: (filters: {
    query: string;
    provincia: string;
    localidad: string;
    fecha: string;
  }) => void;
}

const fechas = [
  "Hoy",
  "Esta semana",
  "Este fin de semana",
  "Este mes",
  "Próximo mes",
];

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const availableLocalidades = useMemo(
    () => (provincia ? localidades[provincia] || [] : []),
    [provincia],
  );

  const hasActiveFilters =
    query.trim() !== "" ||
    provincia.trim() !== "" ||
    localidad.trim() !== "" ||
    fecha.trim() !== "";

  const handleSearch = () => {
    onSearch?.({ query, provincia, localidad, fecha });
  };

  const handleClearFilters = () => {
    setQuery("");
    setProvincia("");
    setLocalidad("");
    setFecha("");
    onSearch?.({ query: "", provincia: "", localidad: "", fecha: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div data-nav-section="filtros">
      <div
        style={{
          padding: "1.25rem 1.5rem 0",
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            padding: "0.625rem",
            boxShadow: "0 10px 30px rgba(10, 5, 20, 0.24)",
          }}
          className="search-shell"
        >
          {/* Main row: input with embedded search button */}
          <div
            className="search-control"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0 0.5rem 0 0.875rem",
            }}
          >
            <span
              style={{
                color: "var(--text-disabled)",
                display: "flex",
                flexShrink: 0,
              }}
            >
              <EvaIcon name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#1f1f1f",
                fontSize: "var(--font-base)",
                fontWeight: 500,
                outline: "none",
                padding: "0.875rem 0",
                minWidth: 0,
              }}
            />
            <button
              onClick={handleSearch}
              className="search-btn-inline"
              aria-label="Buscar"
            >
              <EvaIcon name="search" size={20} />
            </button>
          </div>

          {/* Advanced filters (collapsible) */}
          {advancedOpen && (
            <div
              className="search-advanced-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {/* Fecha */}
              <select
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="search-select search-select-date"
              >
                <option value="">Fecha</option>
                {fechas.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* Provincia */}
              <select
                value={provincia}
                onChange={(e) => {
                  setProvincia(e.target.value);
                  setLocalidad("");
                }}
                className="search-select search-select-provincia"
              >
                <option value="">Provincia</option>
                {provincias.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Localidad */}
              <select
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                disabled={availableLocalidades.length === 0}
                className="search-select search-select-localidad"
                style={{ opacity: availableLocalidades.length === 0 ? 0.4 : 1 }}
              >
                <option value="">Localidad</option>
                {availableLocalidades.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Advanced toggle + clear filters row */}
        <div
          style={{
            display: "flex",
            justifyContent: hasActiveFilters ? "space-between" : "flex-end",
            alignItems: "center",
            maxWidth: "1120px",
            margin: "0.5rem auto 0",
            padding: "0 4px",
          }}
        >
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="search-clear-btn"
            >
              <EvaIcon name="close" size={12} /> Limpiar filtros
            </button>
          )}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            className="search-advanced-toggle"
          >
            Búsqueda avanzada {advancedOpen ? "−" : "+"}
          </button>
        </div>
      </div>

      <style>{`
        .search-control {
          background: #f5f6fa;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .search-control:focus-within {
          border-color: var(--primary-25);
          background: #eef0f6;
        }
        .search-input::placeholder {
          color: #7b7b7b;
        }
        .search-btn-inline {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-accent);
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .search-btn-inline:hover {
          background: var(--color-accent-hover);
          transform: scale(1.05);
        }
        .search-advanced-toggle {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: var(--font-xs);
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          padding: 0.25rem 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .search-advanced-toggle:hover {
          opacity: 0.8;
        }
        .search-select {
          padding: 12px 36px 12px 14px;
          background: #f5f6fa;
          border: 1px solid transparent;
          color: #1f1f1f;
          font-size: var(--font-sm);
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: background-color 0.2s ease, border-color 0.2s ease;
          border-radius: var(--radius-md);
          min-width: 0;
        }
        .search-select:hover {
          background-color: #eef0f6;
          border-color: var(--border-color);
        }
        .search-select:focus {
          background-color: #eef0f6;
          border-color: var(--primary-25);
        }
        .search-select option {
          background: #ffffff;
          color: #1f1f1f;
        }
        .search-clear-btn {
          background: var(--bg-surface-1);
          color: var(--text-secondary);
          font-size: var(--font-xs);
          font-weight: 600;
          font-family: inherit;
          min-height: 30px;
          padding: 0 10px;
          border: 1px solid var(--border-color-40);
          border-radius: var(--radius-full);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
        }
        .search-clear-btn:hover {
          color: var(--text-secondary);
          border-color: var(--border-color);
          background: var(--bg-surface-2);
        }
        @media (max-width: 768px) {
          .search-shell {
            padding: 8px;
          }
          .search-advanced-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .search-advanced-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
