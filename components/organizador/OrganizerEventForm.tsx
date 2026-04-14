"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/data/events";
import { localidades, provincias } from "@/data/locations";
import EvaIcon from "@/components/EvaIcon";
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

const previewThumbWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.5rem 0.625rem",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  background: "#ffffff",
  maxWidth: "360px",
};

const previewThumbFrame: React.CSSProperties = {
  position: "relative",
  width: "48px",
  height: "60px",
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: "4px",
  background: "#eef1f7",
};

const previewRemoveBtn: React.CSSProperties = {
  marginLeft: "auto",
  background: "#fff1f2",
  border: "1px solid #fecaca",
  cursor: "pointer",
  color: "#b91c1c",
  padding: "6px 10px",
  borderRadius: "6px",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "var(--font-xs)",
  fontWeight: 600,
  whiteSpace: "nowrap",
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

function normalizeBannerValue(image: string, flyer: string): string {
  const trimmedImage = image.trim();
  const trimmedFlyer = flyer.trim();
  if (!trimmedImage) return "";
  if (trimmedFlyer && trimmedImage === trimmedFlyer) return "";
  return trimmedImage;
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

  const categories = backendCategories.map((category) => category.nombre);

  const { data: mpStatus, isLoading: isMpStatusLoading } = useQuery({
    queryKey: ["organizer-mercadopago-status"],
    queryFn: fetchOrganizerMercadoPagoStatus,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

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
    category: categories[0] ?? "",
    image: "",
    flyer: "",
    featured: false,
    tags: [],
    direccion: "",
    organizador: "",
    totalEntradas: 100,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"] as "mercadopago"[],
    mercadoPagoId: "",
  };
  const defaultProvincia = matchProvinciaOption(defaults.provincia);
  const defaultLocalidad = matchLocalidadOption(
    defaultProvincia,
    defaults.localidad,
  );
  const defaultDate = eventDateLabelToInputValue(defaults.date);
  const defaultTime = normalizeEventTimeInput(defaults.time);
  const initialBanner = normalizeBannerValue(defaults.image, defaults.flyer);

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
  const [organizador, setOrganizador] = useState(defaults.organizador);
  const [image, setImage] = useState(initialBanner);
  const [flyer, setFlyer] = useState(defaults.flyer);
  const [price, setPrice] = useState(String(defaults.price));
  const [totalEntradas, setTotalEntradas] = useState(
    String(defaults.totalEntradas),
  );
  // Por el momento el único medio de cobro es Mercado Pago.
  // El tipo `mediosDePago` se mantiene como union para poder agregar otros
  // medios (ej: transferencia) en el futuro sin romper el modelo de datos.
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isFlyerDragOver, setIsFlyerDragOver] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

  const handleAssetFile = (file: File, target: "image" | "flyer") => {
    if (!file.type.startsWith("image/")) return;
    if (target === "image") {
      handleFileToDataUrl(file, setImage);
      return;
    }
    handleFileToDataUrl(file, setFlyer);
  };

  const availableLocalidades = useMemo(
    () => (provincia ? (localidades[provincia] ?? []) : []),
    [provincia],
  );
  const timePeriod = getEventTimePeriod(time);
  const categoryOptions = useMemo(() => {
    const normalizedCurrent = category.trim().toLowerCase();
    if (!normalizedCurrent) return categories;
    if (categories.some((item) => item.toLowerCase() === normalizedCurrent)) {
      return categories;
    }
    return [category, ...categories];
  }, [categories, category]);
  const selectedCategory =
    categoryOptions.length > 0 &&
    !categoryOptions.some((item) => item.toLowerCase() === category.toLowerCase())
      ? categoryOptions[0]
      : category;
  const isMercadoPagoReady =
    mpStatus?.status === "CONECTADA" || mpStatus?.mode === "platform_test";

  const isPriceValid = price.trim() !== "" && Number(price) >= 0 && !Number.isNaN(Number(price));
  const canSubmit =
    categoryOptions.length > 0 &&
    title.trim() &&
    selectedCategory.trim() &&
    longDescription.trim() &&
    organizador.trim() &&
    date.trim() &&
    isCompleteEventTime(time) &&
    venue.trim() &&
    direccion.trim() &&
    provincia.trim() &&
    localidad.trim() &&
    flyer.trim() &&
    isPriceValid &&
    isMercadoPagoReady &&
    !isMpStatusLoading;
  const firstMissingField = useMemo(() => {
    if (!flyer.trim()) return "Flyer / Poster del evento";
    if (!title.trim()) return "Título";
    if (categoryOptions.length === 0 || !selectedCategory.trim()) return "Categoría";
    if (!longDescription.trim()) return "Descripción del evento";
    if (!organizador.trim()) return "Nombre del organizador";
    if (!date.trim()) return "Fecha";
    if (!isCompleteEventTime(time)) return "Hora";
    if (!venue.trim()) return "Locación";
    if (!direccion.trim()) return "Dirección";
    if (!provincia.trim()) return "Provincia";
    if (!localidad.trim()) return "Localidad";
    if (!isPriceValid) return "Precio de la entrada";
    if (isMpStatusLoading || !isMercadoPagoReady) {
      return "Activá los cobros con Mercado Pago desde el panel";
    }
    return "";
  }, [
    categoryOptions.length,
    date,
    direccion,
    flyer,
    isMercadoPagoReady,
    isMpStatusLoading,
    isPriceValid,
    localidad,
    longDescription,
    organizador,
    provincia,
    selectedCategory,
    time,
    title,
    venue,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setSubmitAttempted(true);
      return;
    }

    setSubmitAttempted(false);

    const mediosDePago: "mercadopago"[] = ["mercadopago"];
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
      category: selectedCategory,
      tags: preservedTags,
      date: eventDateInputToLabel(date),
      time: time.trim(),
      venue: venue.trim(),
      direccion: direccion.trim(),
      provincia,
      localidad,
      organizador: organizador.trim(),
      image: image.trim() || flyer.trim(),
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
    });
  };

  const priceNum = Number(price) || 0;
  const serviceFee = priceNum * 0.05;

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "14px",
          marginBottom: "18px",
        }}
        className="org-form-grid"
      >
        <div
          style={fieldBox}
        >
          {flyer.trim() && (
            <div style={previewThumbWrap}>
              <div style={previewThumbFrame}>
                <Image
                  src={flyer}
                  alt="Preview del flyer"
                  fill
                  sizes="48px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span
                style={{
                  fontSize: "var(--font-xs)",
                  color: "#1f1f1f",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Flyer / Poster del evento
              </span>
              <button
                type="button"
                style={previewRemoveBtn}
                title="Quitar flyer cargado"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFlyer("");
                  if (flyerInputRef.current) flyerInputRef.current.value = "";
                }}
              >
                <EvaIcon name="trash-2-outline" size={16} />
                Quitar
              </button>
            </div>
          )}

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
              handleAssetFile(file, "flyer");
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
              handleAssetFile(file, "flyer");
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

        <div style={fieldBox}>
          {image.trim() && (
            <div style={previewThumbWrap}>
              <div
                style={{
                  ...previewThumbFrame,
                  width: "64px",
                  height: "40px",
                }}
              >
                <Image
                  src={image}
                  alt="Preview del banner"
                  fill
                  sizes="64px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span
                style={{
                  fontSize: "var(--font-xs)",
                  color: "#1f1f1f",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Banner para carrusel
              </span>
              <button
                type="button"
                style={previewRemoveBtn}
                title="Quitar banner cargado"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImage("");
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                <EvaIcon name="trash-2-outline" size={16} />
                Quitar
              </button>
            </div>
          )}

          <label
            style={{
              ...labelStyle,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <EvaIcon name="image" size={14} />
            {renderFieldLabel("Banner del evento", { optional: true })}
          </label>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleAssetFile(file, "image");
            }}
            style={{ display: "none" }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsImageDragOver(true);
            }}
            onDragLeave={() => setIsImageDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsImageDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              handleAssetFile(file, "image");
            }}
            onClick={() => imageInputRef.current?.click()}
            style={{
              border: "1px dashed var(--border-color)",
              borderRadius: "var(--radius-md)",
              background: isImageDragOver ? "#eceff8" : "#f5f6fa",
              padding: "16px",
              minHeight: "152px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            <EvaIcon name="upload" size={20} />
            <strong style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}>
              Arrastra o busca el banner
            </strong>
            <span style={{ fontSize: "var(--font-xs)", color: "#5b5b66" }}>
              {image.trim()
                ? "Banner cargado correctamente"
                : "Opcional. Se usa en el carrusel principal. Formato recomendado: JPG o PNG"}
            </span>
          </div>
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
            {renderFieldLabel("Título", { required: true })}
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
            {renderFieldLabel("Nombre visible del organizador", {
              required: true,
            })}
          </label>
          <input
            value={organizador}
            onChange={(e) => setOrganizador(e.target.value)}
            style={inputStyle}
            placeholder="Ej: Polka Produce"
          />
          <span
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-disabled)",
            }}
          >
            Este nombre se muestra en la app, tickets y compras.
          </span>
        </div>

        <div style={fieldBox}>
          <label style={labelStyle}>
            {renderFieldLabel("Categoría", { required: true })}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
            disabled={categoryOptions.length === 0}
          >
            {categoryOptions.length === 0 && (
              <option value="">No hay categorías disponibles</option>
            )}
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {categoryOptions.length === 0 && (
            <span
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
              }}
            >
              Las categorías se administran desde el panel de admin. Creá una
              categoría para publicar eventos.
            </span>
          )}
        </div>

        <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            {renderFieldLabel("Descripción del evento", { required: true })}
          </label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            style={textAreaStyle}
            placeholder="Contale al público qué va a vivir en el evento, quiénes participan, desde qué hora se ingresa y cualquier detalle importante antes de comprar."
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
            {renderFieldLabel("Locación (lugar)", { required: true })}
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
            {renderFieldLabel("Dirección", { required: true })}
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
                : "Primero elegí una provincia"}
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
            {renderFieldLabel("Precio de la entrada", { required: true })}
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
            placeholder="Ej: 12000 (0 = evento gratis)"
          />
          {price.trim() !== "" && priceNum === 0 && (
            <span
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--color-primary)",
                fontWeight: 700,
              }}
            >
              Evento gratis
            </span>
          )}
          {priceNum > 0 && (
            <span
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
              }}
            >
              Comisión Andino: ${serviceFee.toFixed(2)} (5%) - El comprador paga
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
        {!canSubmit && submitAttempted && firstMissingField ? (
          <span
            style={{
              fontSize: "var(--font-xs)",
              color: "#f3c7d1",
              textAlign: "right",
            }}
          >
            {firstMissingField.startsWith("Activá")
              ? firstMissingField + "."
              : firstMissingField + " es obligatorio."}
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

