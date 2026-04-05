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

const requiredAsteriskStyle: React.CSSProperties = {
  color: "#d7263d",
  marginLeft: "0.125rem",
  fontWeight: 900,
};

const optionalHintStyle: React.CSSProperties = {
  color: "var(--text-disabled)",
  fontWeight: 600,
};

function renderFieldLabel(
  label: string,
  options?: { required?: boolean; optional?: boolean },
) {
  return (
    <>
      {label}
      {options?.required ? <span style={requiredAsteriskStyle}>*</span> : null}
      {options?.optional ? (
        <span style={optionalHintStyle}> (opcional)</span>
      ) : null}
    </>
  );
}

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
    flyer.trim() &&
    (paymentMethod === "mercadopago"
      ? isMercadoPagoReady && !isMpStatusLoading
      : cbuCvu.trim());
  const firstMissingField = useMemo(() => {
    if (!flyer.trim()) return "Flyer / Poster del evento";
    if (!title.trim()) return "Titulo";
    if (!category.trim()) return "Categoria";
    if (!longDescription.trim()) return "Descripcion del evento";
    if (!date.trim()) return "Fecha";
    if (!isCompleteEventTime(time)) return "Hora";
    if (!venue.trim()) return "Locacion";
    if (!provincia.trim()) return "Provincia";
    if (!localidad.trim()) return "Localidad";
    if (paymentMethod === "mercadopago") {
      if (isMpStatusLoading || !isMercadoPagoReady) {
        return "Mercado Pago activo";
      }
    }
    if (paymentMethod === "transferencia" && !cbuCvu.trim()) {
      return "CBU / CVU";
    }
    return "";
  }, [
    category,
    cbuCvu,
    date,
    flyer,
    isMercadoPagoReady,
    isMpStatusLoading,
    localidad,
    longDescription,
    paymentMethod,
    provincia,
    time,
    title,
    venue,
  ]);
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
          {renderFieldLabel("Flyer / Poster del evento", { required: true })}
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
              : "Obligatorio para publicar. Formato recomendado: JPG o PNG"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "14px",
        }}
        className="org-form-grid"
      >
        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Titulo", { required: true })}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Ej: Noche Andina en Vivo"
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Categoria", { required: true })}
          </label>
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
          <label style={labelStyle}>
            {renderFieldLabel("Descripcion del evento", { required: true })}
          </label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            style={textAreaStyle}
            placeholder="Contale al publico que va a vivir en el evento, quienes participan, desde que hora se ingresa y cualquier detalle importante antes de comprar."
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Fecha", { required: true })}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Hora", { required: true })}
          </label>
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
              placeholder="Ej: 21:30"
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
          <label style={labelStyle}>
            {renderFieldLabel("Locacion (lugar)", { required: true })}
          </label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            style={inputStyle}
            placeholder="Ej: Club Cultural Matienzo"
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Direccion", { optional: true })}
          </label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={inputStyle}
            placeholder="Ej: Pringles 1249, CABA"
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Provincia", { required: true })}
          </label>
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
          <label style={labelStyle}>
            {renderFieldLabel("Localidad", { required: true })}
          </label>
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
          <label style={labelStyle}>
            {renderFieldLabel("Precio de la entrada", { optional: true })}
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
            placeholder="Ej: 12000"
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
          <label style={labelStyle}>
            {renderFieldLabel("Cantidad de Entradas", { optional: true })}
          </label>
          <input
            type="number"
            min={0}
            value={totalEntradas}
            onChange={(e) => setTotalEntradas(e.target.value)}
            style={inputStyle}
            placeholder="Ej: 180"
          />
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Medio de pago", { required: true })}
          </label>
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
            <label style={labelStyle}>
              {renderFieldLabel("Cobros con Mercado Pago", { required: true })}
            </label>
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
            <label style={labelStyle}>
              {renderFieldLabel("CBU / CVU", { required: true })}
            </label>
            <input
              value={cbuCvu}
              onChange={(e) => setCbuCvu(e.target.value)}
              style={inputStyle}
              placeholder="Ej: 0000003100000001234567"
            />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.375rem",
          justifyContent: "flex-end",
        }}
      >
        {!canSubmit && firstMissingField ? (
          <span
            style={{
              fontSize: "var(--font-xs)",
              color: "#f3c7d1",
              textAlign: "right",
            }}
          >
            {firstMissingField} es obligatorio.
          </span>
        ) : null}
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
        @media (min-width: 48rem) {
          .org-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.875rem !important;
          }
        }
      `}</style>
    </form>
  );
}
