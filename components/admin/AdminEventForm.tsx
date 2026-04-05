"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { Event } from "@/data/events";
import { localidades, provincias } from "@/data/locations";
import EvaIcon from "@/components/EvaIcon";
import { useAdmin } from "@/context/AdminContext";
import {
  eventDateInputToLabel,
  eventDateLabelToInputValue,
  getEventTimePeriod,
  isCompleteEventTime,
  matchLocalidadOption,
  matchProvinciaOption,
  normalizeEventTimeInput,
} from "@/lib/event-form-utils";

interface AdminEventFormProps {
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
  minHeight: "6rem",
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

const tabButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  padding: "0.625rem 0.875rem",
  fontSize: "var(--font-sm)",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
};

const activeTabStyle: React.CSSProperties = {
  background: "#9a83d8",
  color: "#ffffff",
  border: "1px solid #b9a6ea",
  boxShadow: "0 0 0 1px rgba(185, 166, 234, 0.35)",
};

const previewGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "0.75rem",
};

const previewCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.875rem",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  background: "#ffffff",
};

const previewFrameStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 10",
  overflow: "hidden",
  borderRadius: "calc(var(--radius-md) - 2px)",
  background: "#eef1f7",
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

function defaultEventValues(category: string): Omit<Event, "id"> {
  return {
    title: "",
    description: "",
    longDescription: "",
    date: "",
    time: "",
    venue: "",
    provincia: "",
    localidad: "",
    price: 0,
    category,
    image: "",
    flyer: "",
    featured: false,
    tags: [],
    direccion: "",
    organizador: "",
    totalEntradas: 100,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
    cbuCvu: "",
  };
}

export default function AdminEventForm({
  mode,
  initialEvent,
  onSubmit,
  submitLabel,
}: AdminEventFormProps) {
  const { categories } = useAdmin();
  const fallbackCategory = categories[0] ?? "General";
  const defaults = initialEvent ?? defaultEventValues(fallbackCategory);
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
  const [organizador, setOrganizador] = useState(defaults.organizador);
  const [image, setImage] = useState(defaults.image);
  const [flyer, setFlyer] = useState(defaults.flyer);
  const [price, setPrice] = useState(String(defaults.price));
  const [totalEntradas, setTotalEntradas] = useState(
    String(defaults.totalEntradas),
  );
  const [mercadoPagoId, setMercadoPagoId] = useState(defaults.mercadoPagoId);
  const [paymentMethod, setPaymentMethod] = useState<
    "transferencia" | "mercadopago"
  >(
    defaults.mediosDePago.includes("transferencia")
      ? "transferencia"
      : "mercadopago",
  );
  const [cbuCvu, setCbuCvu] = useState(defaults.cbuCvu ?? "");
  const [activeTab, setActiveTab] = useState<"info" | "media">("info");
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

  const selectedCategory =
    categories.length > 0 &&
    !categories.some((item) => item.toLowerCase() === category.toLowerCase())
      ? categories[0]
      : category;

  const initialPaymentMethod: "transferencia" | "mercadopago" =
    defaults.mediosDePago.includes("transferencia")
      ? "transferencia"
      : "mercadopago";

  const initialComparable = useMemo(
    () => ({
      title: defaults.title.trim(),
      longDescription: defaults.longDescription.trim(),
      category: defaults.category,
      date: eventDateInputToLabel(defaultDate),
      time: defaultTime,
      venue: defaults.venue.trim(),
      direccion: defaults.direccion.trim(),
      provincia: defaultProvincia,
      localidad: defaultLocalidad,
      organizador: defaults.organizador.trim(),
      image: defaults.image.trim(),
      flyer: defaults.flyer.trim(),
      price: Number(defaults.price) || 0,
      totalEntradas: Math.max(0, Number(defaults.totalEntradas) || 0),
      paymentMethod: initialPaymentMethod,
      mercadoPagoId:
        initialPaymentMethod === "mercadopago"
          ? (defaults.mercadoPagoId ?? "").trim()
          : "",
      cbuCvu:
        initialPaymentMethod === "transferencia"
          ? (defaults.cbuCvu ?? "").trim()
          : "",
    }),
    [
      defaultDate,
      defaultLocalidad,
      defaultProvincia,
      defaultTime,
      defaults,
      initialPaymentMethod,
    ],
  );

  const currentComparable = useMemo(
    () => ({
      title: title.trim(),
      longDescription: longDescription.trim(),
      category: selectedCategory,
      date: eventDateInputToLabel(date),
      time: time.trim(),
      venue: venue.trim(),
      direccion: direccion.trim(),
      provincia,
      localidad,
      organizador: organizador.trim(),
      image: image.trim(),
      flyer: flyer.trim(),
      price: Number(price) || 0,
      totalEntradas: Math.max(0, Number(totalEntradas) || 0),
      paymentMethod,
      mercadoPagoId:
        paymentMethod === "mercadopago" ? mercadoPagoId.trim() : "",
      cbuCvu: paymentMethod === "transferencia" ? cbuCvu.trim() : "",
    }),
    [
      title,
      longDescription,
      selectedCategory,
      date,
      time,
      venue,
      direccion,
      provincia,
      localidad,
      organizador,
      image,
      flyer,
      price,
      totalEntradas,
      paymentMethod,
      mercadoPagoId,
      cbuCvu,
    ],
  );

  const hasChanges =
    mode === "create"
      ? true
      : JSON.stringify(currentComparable) !== JSON.stringify(initialComparable);

  const baseCanSubmit =
    categories.length > 0 &&
    title.trim() &&
    selectedCategory.trim() &&
    longDescription.trim() &&
    date.trim() &&
    isCompleteEventTime(time) &&
    venue.trim() &&
    provincia.trim() &&
    localidad.trim() &&
    // Imagen obligatoria solo al crear. En edicion puede mantenerse la existente.
    (mode === "edit" || image.trim());

  const canSubmit = baseCanSubmit && hasChanges;
  const firstMissingField = useMemo(() => {
    if (!title.trim()) return "Titulo";
    if (categories.length === 0 || !selectedCategory.trim()) {
      return "Categoria";
    }
    if (!longDescription.trim()) return "Descripcion larga";
    if (!date.trim()) return "Fecha";
    if (!isCompleteEventTime(time)) return "Hora";
    if (!venue.trim()) return "Locacion";
    if (!provincia.trim()) return "Provincia";
    if (!localidad.trim()) return "Localidad";
    if (mode === "create" && !image.trim()) return "Imagen del evento";
    return "";
  }, [
    categories.length,
    date,
    image,
    localidad,
    longDescription,
    mode,
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
      category: selectedCategory,
      tags: preservedTags,
      date: eventDateInputToLabel(date),
      time: time.trim(),
      venue: venue.trim(),
      direccion: direccion.trim(),
      provincia,
      localidad,
      organizador: organizador.trim(),
      image: image.trim(),
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
      mercadoPagoId:
        paymentMethod === "mercadopago" ? mercadoPagoId.trim() : "",
      cbuCvu: paymentMethod === "transferencia" ? cbuCvu.trim() : "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          gap: "0.625rem",
          marginBottom: "0.875rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "info"
              ? activeTabStyle
              : { background: "#f5f6fa", color: "#1f1f1f" }),
          }}
        >
          <EvaIcon name="edit" size={14} />
          Informacion del evento
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          style={{
            ...tabButtonStyle,
            ...(activeTab === "media"
              ? activeTabStyle
              : { background: "#f5f6fa", color: "#1f1f1f" }),
          }}
        >
          <EvaIcon name="image" size={14} />
          Imagenes y flyer
        </button>
      </div>

      {activeTab === "info" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0.625rem",
          }}
          className="admin-form-grid"
        >
          <div style={fieldBox}>
            <label style={labelStyle}>
              {renderFieldLabel("Titulo", { required: true })}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Festival Andino de Otono"
            />
          </div>

          <div style={fieldBox}>
            <label style={labelStyle}>
              {renderFieldLabel("Categoria", { required: true })}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
              disabled={categories.length === 0}
            >
              {categories.length === 0 && (
                <option value="">No hay categorias disponibles</option>
              )}
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <span
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--text-disabled)",
                }}
              >
                Agrega categorias desde el panel de admin para poder crear
                eventos.
              </span>
            )}
          </div>

          <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              {renderFieldLabel("Descripcion larga", { required: true })}
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              style={textAreaStyle}
              placeholder="Contale al publico de que se trata el evento, quienes participan, desde que hora se puede ingresar y cualquier detalle importante para la compra."
            />
          </div>

          <div style={fieldBox}>
            <label style={labelStyle}>
              {renderFieldLabel("Organizador", { optional: true })}
            </label>
            <input
              value={organizador}
              onChange={(e) => setOrganizador(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Andino Producciones"
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
                onChange={(e) =>
                  setTime(normalizeEventTimeInput(e.target.value))
                }
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
              {renderFieldLabel("Locacion", { required: true })}
            </label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Teatro Gran Rex"
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
              placeholder="Ej: Av. Corrientes 857, CABA"
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
              {renderFieldLabel("Precio", { optional: true })}
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
              placeholder="Ej: 15000"
            />
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
              placeholder="Ej: 250"
            />
          </div>

          <div style={fieldBox}>
            <label style={labelStyle}>
              {renderFieldLabel("Medio de pago", { optional: true })}
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
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {paymentMethod === "transferencia" && (
            <div style={fieldBox}>
              <label style={labelStyle}>
                {renderFieldLabel("CBU / CVU", { optional: true })}
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
      )}

      {activeTab === "media" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0.625rem",
          }}
          className="admin-form-grid"
        >
          {(image.trim() || flyer.trim()) && (
            <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
              <span style={labelStyle}>
                {mode === "edit"
                  ? "Preview de archivos actuales"
                  : "Preview de archivos seleccionados"}
              </span>
              <div style={previewGridStyle} className="admin-preview-grid">
                {image.trim() && (
                  <div style={previewCardStyle}>
                    <strong
                      style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}
                    >
                      {mode === "edit"
                        ? "Imagen principal actual"
                        : "Imagen principal"}
                    </strong>
                    <div style={previewFrameStyle}>
                      <Image
                        src={image}
                        alt="Preview de la imagen del evento"
                        fill
                        sizes="(min-width: 48rem) 50vw, 100vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--text-disabled)",
                      }}
                    >
                      {mode === "edit"
                        ? "Si subis una nueva imagen, esta vista previa se actualiza antes de guardar."
                        : "Asi se vera la imagen que acabas de cargar."}
                    </span>
                  </div>
                )}

                {flyer.trim() && (
                  <div style={previewCardStyle}>
                    <strong
                      style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}
                    >
                      {mode === "edit" ? "Flyer actual" : "Flyer"}
                    </strong>
                    <div
                      style={{
                        ...previewFrameStyle,
                        aspectRatio: "4 / 5",
                      }}
                    >
                      <Image
                        src={flyer}
                        alt="Preview del flyer del evento"
                        fill
                        sizes="(min-width: 48rem) 50vw, 100vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "var(--font-xs)",
                        color: "var(--text-disabled)",
                      }}
                    >
                      {mode === "edit"
                        ? "Tambien podes reemplazar el flyer y revisar el cambio antes de guardar."
                        : "Vista previa del flyer seleccionado."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={fieldBox}>
            <label
              style={{
                ...labelStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <EvaIcon name="image" size={14} />
              {renderFieldLabel("Imagen del evento", {
                required: mode === "create",
                optional: mode === "edit",
              })}
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
                padding: "1rem",
                minHeight: "9.5rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "0.625rem",
              }}
            >
              <EvaIcon name="upload" size={20} />
              <strong style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}>
                Arrastra o busca la imagen
              </strong>
              <span style={{ fontSize: "var(--font-xs)", color: "#5b5b66" }}>
                {image.trim()
                  ? "Imagen cargada correctamente"
                  : mode === "create"
                    ? "Obligatoria para crear el evento. Formato recomendado: JPG o PNG"
                    : "Opcional al editar. Formato recomendado: JPG o PNG"}
              </span>
            </div>
          </div>

          <div style={fieldBox}>
            <label
              style={{
                ...labelStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <EvaIcon name="image" size={14} />
              {renderFieldLabel("Flyer del evento", { optional: true })}
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
                padding: "1rem",
                minHeight: "9.5rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "0.625rem",
              }}
            >
              <EvaIcon name="upload" size={20} />
              <strong style={{ fontSize: "var(--font-sm)", color: "#1f1f1f" }}>
                Arrastra o busca el flyer
              </strong>
              <span style={{ fontSize: "var(--font-xs)", color: "#5b5b66" }}>
                {flyer.trim()
                  ? "Flyer cargado correctamente"
                  : "Formato recomendado: JPG o PNG"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "1.125rem",
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
            padding: "0.75rem 1.25rem",
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
          .admin-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.875rem !important;
          }
        }
      `}</style>
    </form>
  );
}
