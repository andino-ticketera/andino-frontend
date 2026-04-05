"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/data/events";
import { localidades, provincias } from "@/data/locations";
import EvaIcon from "@/components/EvaIcon";
import { useOrganizer } from "@/context/OrganizerContext";
import { fetchPublicCategories } from "@/lib/categories-api";
import { fetchOrganizerMercadoPagoStatus } from "@/lib/mercadopago-api";
import {
  eventDateInputToLabel,
  eventDateLabelToInputValue,
  getEventTimePeriod,
  isCompleteEventTime,
  matchLocalidadOption,
  matchProvinciaOption,
  normalizeEventTimeInput,
} from "@/lib/event-form-utils";

interface OrganizerEventFormProps {
  mode: "create" | "edit";
  initialEvent?: Event;
  onSubmit: (event: Omit<Event, "id">) => void;
  submitLabel: string;
}

const fallbackCategories = [
  "Musica en Vivo",
  "Fiestas",
  "Teatro",
  "Danza",
  "Recreacion",
  "Arte",
  "Festival",
];

const fieldBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-color)",
  background: "#f5f6fa",
  color: "#1f1f1f",
  borderRadius: "var(--radius-md)",
  padding: "0.625rem 0.75rem",
  fontSize: "var(--font-sm)",
  fontFamily: "inherit",
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "96px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--font-xs)",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

export default function OrganizerEventForm({
  mode,
  initialEvent,
  onSubmit,
  submitLabel,
}: OrganizerEventFormProps) {
  const { data: backendCategories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchPublicCategories,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const categories =
    backendCategories.length > 0
      ? backendCategories.map((category) => category.nombre)
      : fallbackCategories;

  const { data: mpStatus, isLoading: isMpStatusLoading } = useQuery({
    queryKey: ["organizer-mercadopago-status"],
    queryFn: fetchOrganizerMercadoPagoStatus,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const { organizer } = useOrganizer();
  const defaults = initialEvent ?? {
    title: "",
    description: "",
    longDescription: "",
    date: "",
    time: "",
    venue: "",
    provincia: "",
    localidad: "",
    price: 0,
    category: categories[0] ?? "Musica en Vivo",
    image: "",
    flyer: "",
    featured: false,
    tags: [],
    direccion: "",
    organizador: organizer.empresa,
    totalEntradas: 100,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"] as ("transferencia" | "mercadopago")[],
    cbuCvu: "",
  };
  const defaultProvincia = matchProvinciaOption(defaults.provincia);
  const defaultLocalidad = matchLocalidadOption(
    defaultProvincia,
    defaults.localidad,
  );
  const defaultDate = eventDateLabelToInputValue(defaults.date);
  const defaultTime = normalizeEventTimeInput(defaults.time);

  const [title, setTitle] = useState(defaults.title);
  const [longDescription, setLongDescription] = useState(
    defaults.longDescription,
  );
  const [category, setCategory] = useState(defaults.category);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [venue, setVenue] = useState(defaults.venue);
  const [direccion, setDireccion] = useState(defaults.direccion);
  const [provincia, setProvincia] = useState(defaultProvincia);
  const [localidad, setLocalidad] = useState(defaultLocalidad);
  const [flyer, setFlyer] = useState(defaults.flyer);
  const [price, setPrice] = useState(String(defaults.price));
  const [totalEntradas, setTotalEntradas] = useState(
    String(defaults.totalEntradas),
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "transferencia" | "mercadopago"
  >(
    defaults.mediosDePago.includes("transferencia")
      ? "transferencia"
      : "mercadopago",
  );
  const [cbuCvu, setCbuCvu] = useState(defaults.cbuCvu ?? "");
  const [isFlyerDragOver, setIsFlyerDragOver] = useState(false);
  const flyerInputRef = useRef<HTMLInputElement>(null);

  const handleFileToDataUrl = (
    file: File,
    onLoad: (dataUrl: string) => void,
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onLoad(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFlyerFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    handleFileToDataUrl(file, setFlyer);
  };

  const availableLocalidades = useMemo(
    () => (provincia ? (localidades[provincia] ?? []) : []),
    [provincia],
  );
  const timePeriod = getEventTimePeriod(time);
  const isMercadoPagoReady =
    mpStatus?.status === "CONECTADA" || mpStatus?.mode === "platform_test";

  const canSubmit =
    title.trim() &&
    longDescription.trim() &&
    date.trim() &&
    isCompleteEventTime(time) &&
    venue.trim() &&
    provincia.trim() &&
    localidad.trim() &&
    flyer.trim() &&
    (paymentMethod === "mercadopago"
      ? isMercadoPagoReady && !isMpStatusLoading
      : cbuCvu.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const mediosDePago: ("transferencia" | "mercadopago")[] = [paymentMethod];
    const autoDescription =
      mode === "edit" && initialEvent
        ? initialEvent.description
        : longDescription.trim().slice(0, 180);

    const preservedTags =
      mode === "edit" && initialEvent ? initialEvent.tags : [];
    const preservedFeatured =
      mode === "edit" && initialEvent ? initialEvent.featured : false;

    onSubmit({
      title: title.trim(),
      description: autoDescription,
      longDescription: longDescription.trim(),
      category,
      tags: preservedTags,
      date: eventDateInputToLabel(date),
      time: time.trim(),
      venue: venue.trim(),
      direccion: direccion.trim(),
      provincia,
      localidad,
      organizador: organizer.empresa,
      image: flyer.trim(),
      flyer: flyer.trim(),
      price: Number(price) || 0,
      featured: preservedFeatured,
      totalEntradas: Math.max(0, Number(totalEntradas) || 0),
      entradasVendidas:
        mode === "edit" && initialEvent
          ? Math.min(
              initialEvent.entradasVendidas,
              Math.max(0, Number(totalEntradas) || 0),
            )
          : 0,
      mediosDePago,
      mercadoPagoId: "",
      cbuCvu: paymentMethod === "transferencia" ? cbuCvu.trim() : "",
    });
  };

  const priceNum = Number(price) || 0;
  const serviceFee = priceNum * 0.05;

  return (
    <form onSubmit={handleSubmit}>
      {/* Flyer upload at top */}
      <div style={{ ...fieldBox, marginBottom: "18px" }}>
        <label
          style={{
            ...labelStyle,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <EvaIcon name="image" size={14} />
          Flyer / Poster del evento
        </label>

        <input
          ref={flyerInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleFlyerFile(file);
          }}
          style={{ display: "none" }}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsFlyerDragOver(true);
          }}
          onDragLeave={() => setIsFlyerDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsFlyerDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            handleFlyerFile(file);
          }}
          onClick={() => flyerInputRef.current?.click()}
          style={{
            border: "1px dashed var(--border-color)",
            borderRadius: "var(--radius-md)",
            background: isFlyerDragOver ? "#eceff8" : "#f5f6fa",
            padding: "16px",
            minHeight: "152px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
            maxWidth: "400px",
          }}
        >
          <EvaIcon name="upload" size={20} />
          <strong style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}>
            Arrastra o busca el flyer
          </strong>
          <span style={{ fontSize: "var(--font-xs)", color: "#5b5b66" }}>
            {flyer.trim()
              ? "Flyer cargado correctamente"
              : "Solo una imagen. Formato recomendado: JPG o PNG"}
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
        }}
        className="org-form-grid"
      >
        <div style={fieldBox}>
          <label style={labelStyle}>Titulo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Descripcion del evento</label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            style={textAreaStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Hora</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <input
              inputMode="numeric"
              value={time}
              onChange={(e) => setTime(normalizeEventTimeInput(e.target.value))}
              style={inputStyle}
              placeholder="Ej: 1115"
              maxLength={5}
            />
            <span
              aria-live="polite"
              style={{
                minWidth: "3.25rem",
                textAlign: "center",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "0.625rem 0.75rem",
                background: "#ffffff",
                color: timePeriod ? "#1f1f1f" : "var(--text-disabled)",
                fontSize: "var(--font-xs)",
                fontWeight: 700,
              }}
            >
              {timePeriod || "--"}
            </span>
          </div>
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Locacion (lugar)</label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Direccion</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Provincia</label>
          <select
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value);
              setLocalidad("");
            }}
            style={inputStyle}
          >
            <option value="">Seleccionar provincia</option>
            {provincias.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Localidad</label>
          <select
            key={provincia || "sin-provincia"}
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            style={inputStyle}
            disabled={!provincia || availableLocalidades.length === 0}
          >
            <option value="">
              {provincia
                ? "Seleccionar localidad"
                : "Primero elegi una provincia"}
            </option>
            {availableLocalidades.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Precio de la entrada</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />
          {priceNum > 0 && (
            <span
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
              }}
            >
              Comision Andino: ${serviceFee.toFixed(2)} (5%) — El comprador paga
              ${(priceNum + serviceFee).toFixed(2)}
            </span>
          )}
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Cantidad de Entradas</label>
          <input
            type="number"
            min={0}
            value={totalEntradas}
            onChange={(e) => setTotalEntradas(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>Medio de pago</label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "transferencia" | "mercadopago",
              )
            }
            style={inputStyle}
          >
            <option value="mercadopago">Mercado Pago</option>
            <option value="transferencia">Transferencia (CBU/CVU)</option>
          </select>
        </div>

        {paymentMethod === "mercadopago" && (
          <div
            style={{
              ...fieldBox,
              gridColumn: "1 / -1",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "0.875rem",
              background: "var(--bg-surface-2)",
            }}
          >
            <label style={labelStyle}>Cobros con Mercado Pago</label>
            <strong style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}>
              {isMpStatusLoading
                ? "Verificando estado de tu cuenta..."
                : mpStatus?.status === "CONECTADA"
                  ? "Tu cuenta ya esta lista para cobrar con Mercado Pago."
                  : mpStatus?.mode === "platform_test"
                    ? "Estas en modo test: podes publicar ahora o conectar tu cuenta sandbox para probar el flujo real del organizador."
                    : "Antes de publicar con Mercado Pago tenes que activar cobros una sola vez."}
            </strong>
            <span
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                lineHeight: 1.5,
              }}
            >
              {mpStatus?.status === "CONECTADA"
                ? mpStatus.mpEmail
                  ? `Cuenta vinculada: ${mpStatus.mpEmail}`
                  : "La cuenta conectada quedo habilitada para tus proximos eventos."
                : "Desde tu panel podes conectar Mercado Pago, autorizar el acceso y volver para publicar el evento sin cargar datos manuales."}
            </span>
            {!isMercadoPagoReady && !isMpStatusLoading && (
              <Link
                href="/organizador/dashboard"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "var(--font-xs)",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Ir al panel para activar cobros
              </Link>
            )}
          </div>
        )}

        {paymentMethod === "transferencia" && (
          <div style={fieldBox}>
            <label style={labelStyle}>CBU / CVU</label>
            <input
              value={cbuCvu}
              onChange={(e) => setCbuCvu(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary"
          style={{
            background: "var(--color-accent)",
            color: "var(--text-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "12px 20px",
            fontWeight: 700,
            opacity: canSubmit ? 1 : 0.55,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {submitLabel}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .org-form-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .org-form-grid {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }

          .org-form-grid > div {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
}
