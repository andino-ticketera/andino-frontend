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
  "Proximo mes",
];

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [fecha, setFecha] = useState("");

  const availableLocalidades = useMemo(
    () => (provincia ? localidades[provincia] || [] : []),
    [provincia],
  );

  const hasActiveFilters =
    query.trim() !== "" ||
    provincia.trim() !== "" ||
    localidad.trim() !== "" ||
    fecha.trim() !== "";

  const applyFilters = (next: {
    query?: string;
    provincia?: string;
    localidad?: string;
    fecha?: string;
  }) => {
    const payload = {
      query: next.query ?? query,
      provincia: next.provincia ?? provincia,
      localidad: next.localidad ?? localidad,
      fecha: next.fecha ?? fecha,
    };
    onSearch?.(payload);
  };

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
          {/* Row: input + selects */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(260px, 1.8fr) minmax(170px, 1.1fr) minmax(170px, 1.1fr) minmax(170px, 1.1fr) auto",
              gap: "0.5rem",
            }}
            className="search-bar-grid"
          >
            {/* Search input */}
            <div
              className="search-control"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0 0.875rem",
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
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#1f1f1f",
                  fontSize: "var(--font-base)",
                  fontWeight: 500,
                  outline: "none",
                  padding: "0.9375rem 0",
                }}
              />
            </div>

            {/* Provincia */}
            <select
              value={provincia}
              onChange={(e) => {
                const nextProvincia = e.target.value;
                setProvincia(nextProvincia);
                setLocalidad("");
                applyFilters({ provincia: nextProvincia, localidad: "" });
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
              onChange={(e) => {
                const nextLocalidad = e.target.value;
                setLocalidad(nextLocalidad);
                applyFilters({ localidad: nextLocalidad });
              }}
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

            {/* Fecha */}
            <select
              value={fecha}
              onChange={(e) => {
                const nextFecha = e.target.value;
                setFecha(nextFecha);
                applyFilters({ fecha: nextFecha });
              }}
              className="search-select search-select-date"
            >
              <option value="">Fecha</option>
              {fechas.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {/* Search button */}
            <button onClick={handleSearch} className="search-btn">
              Buscar
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="search-clear-row search-clear-row-outside">
            <button
              type="button"
              onClick={handleClearFilters}
              className="search-clear-btn"
            >
              <EvaIcon name="close" size={12} /> Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <style>{`
        .search-select {
          padding: 15px 36px 15px 16px;
          background: #f5f6fa;
          border: 1px solid transparent;
          color: #1f1f1f;
          font-size: var(--font-base);
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: background-color 0.2s ease, border-color 0.2s ease;
          min-width: 140px;
          border-radius: var(--radius-md);
        }
        .search-control {
          background: #f5f6fa;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .search-select-date {
          padding-left: 40px;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-position: left 14px center, right 12px center;
          background-repeat: no-repeat, no-repeat;
        }
        .search-select-provincia,
        .search-select-localidad {
          padding-left: 40px;
        }
        .search-select-provincia {
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-position: left 14px center, right 12px center;
          background-repeat: no-repeat, no-repeat;
        }
        .search-select-localidad {
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3h4v4'/%3E%3Cpath d='M21 3l-7 7'/%3E%3Cpath d='M3 7V3h4'/%3E%3Cpath d='M3 3l7 7'/%3E%3Cpath d='M7 21H3v-4'/%3E%3Cpath d='M3 21l7-7'/%3E%3Cpath d='M21 17v4h-4'/%3E%3Cpath d='M21 21l-7-7'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777B8A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-position: left 14px center, right 12px center;
          background-repeat: no-repeat, no-repeat;
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
        .search-btn {
          background: var(--color-accent);
          color: var(--text-primary);
          font-size: var(--font-base);
          font-weight: 700;
          font-family: inherit;
          padding: 0 24px;
          min-height: 52px;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .search-btn:hover {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
        }
        .search-input::placeholder {
          color: #7b7b7b;
        }
        .search-control:focus-within {
          border-color: var(--primary-25);
          background: #eef0f6;
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
        .search-clear-row {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          padding: 0 4px;
        }
        .search-clear-row-outside {
          max-width: 1120px;
          margin-left: auto;
          margin-right: auto;
        }
        @media (max-width: 768px) {
          .search-shell {
            padding: 8px;
          }
          .search-bar-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px;
          }
          .search-bar-grid > div:first-child {
            grid-column: 1 / -1;
          }
          .search-btn {
            grid-column: 1 / -1;
            width: 100%;
          }
          .search-clear-btn {
            font-size: var(--font-sm);
          }
          .search-clear-row {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .search-bar-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
