"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { Event } from "@/data/events";
import { localidades, provincias } from "@/data/locations";
import AppConfirmDialog from "@/components/AppConfirmDialog";
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

export interface AdminEventFormOrganizerOption {
  id: string;
  nombreCompleto: string;
  email: string;
}

export interface AdminEventFormSubmitOptions {
  organizadorId?: string;
}

interface AdminEventFormProps {
  mode: "create" | "edit";
  initialEvent?: Event;
  onSubmit: (
    event: Omit<Event, "id">,
    options?: AdminEventFormSubmitOptions,
  ) => void;
  submitLabel: string;
  // Si se proveen, se muestra un selector "Asignar a organizador" al inicio del
  // formulario. Solo tiene sentido cuando el caller es ADMIN creando un evento.
  organizers?: AdminEventFormOrganizerOption[];
  organizersLoading?: boolean;
  organizerPanelUrl?: string;
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
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const previewThumbWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: "0.625rem",
  padding: "0.5rem 0.625rem",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-md)",
  background: "#ffffff",
  width: "100%",
};

const previewThumbFrame: React.CSSProperties = {
  position: "relative",
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
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  fontSize: "var(--font-xs)",
  fontWeight: 700,
  minHeight: "2.5rem",
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
  };
}

export default function AdminEventForm({
  mode,
  initialEvent,
  onSubmit,
  submitLabel,
  organizers,
  organizersLoading = false,
  organizerPanelUrl,
}: AdminEventFormProps) {
  const showOrganizerSelector = mode === "create" && Array.isArray(organizers);
  const [assignedOrganizerId, setAssignedOrganizerId] = useState<string>("");
  const [copiedPanelLink, setCopiedPanelLink] = useState(false);

  const selectedOrganizer = useMemo(() => {
    if (!assignedOrganizerId || !organizers) return null;
    return organizers.find((item) => item.id === assignedOrganizerId) ?? null;
  }, [assignedOrganizerId, organizers]);

  const handleAssignedOrganizerChange = (nextOrganizerId: string) => {
    setAssignedOrganizerId(nextOrganizerId);
    if (mode !== "create" || organizador.trim() || !organizers) {
      return;
    }

    const matchedOrganizer = organizers.find((item) => item.id === nextOrganizerId);
    const matchedName = matchedOrganizer?.nombreCompleto?.trim();
    if (matchedName) {
      setOrganizador(matchedName);
    }
  };

  const handleCopyPanelLink = async () => {
    if (!organizerPanelUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(organizerPanelUrl);
        setCopiedPanelLink(true);
        setTimeout(() => setCopiedPanelLink(false), 2000);
      }
    } catch {
      // silencioso: el admin siempre puede copiar manualmente
    }
  };
  const { categories } = useAdmin();
  const fallbackCategory = categories[0] ?? "";
  const defaults = initialEvent ?? defaultEventValues(fallbackCategory);
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
  const mercadoPagoId = defaults.mercadoPagoId ?? "";
  const [activeTab, setActiveTab] = useState<"info" | "media">("info");
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isFlyerDragOver, setIsFlyerDragOver] = useState(false);
  const [hasImageMediaChange, setHasImageMediaChange] = useState(false);
  const [hasFlyerMediaChange, setHasFlyerMediaChange] = useState(false);
  const [pendingAssetRemoval, setPendingAssetRemoval] = useState<
    "flyer" | "image" | null
  >(null);
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
      handleFileToDataUrl(file, (dataUrl) => {
        setImage(dataUrl);
        setHasImageMediaChange(true);
      });
      return;
    }
    handleFileToDataUrl(file, (dataUrl) => {
      setFlyer(dataUrl);
      setHasFlyerMediaChange(true);
    });
  };

  const handleConfirmAssetRemoval = () => {
    if (pendingAssetRemoval === "flyer") {
      setFlyer("");
      setHasFlyerMediaChange(true);
      if (flyerInputRef.current) {
        flyerInputRef.current.value = "";
      }
    }

    if (pendingAssetRemoval === "image") {
      setImage("");
      setHasImageMediaChange(true);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }

    setPendingAssetRemoval(null);
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
      image: initialBanner,
      flyer: defaults.flyer.trim(),
      price: Number(defaults.price) || 0,
      totalEntradas: Math.max(0, Number(defaults.totalEntradas) || 0),
      mercadoPagoId: (defaults.mercadoPagoId ?? "").trim(),
    }),
    [
      defaultDate,
      defaultLocalidad,
      defaultProvincia,
      defaultTime,
      defaults,
      initialBanner,
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
      mercadoPagoId: mercadoPagoId.trim(),
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
      mercadoPagoId,
    ],
  );

  const hasMediaChanges = hasImageMediaChange || hasFlyerMediaChange;

  const hasChanges =
    mode === "create"
      ? true
      : hasMediaChanges ||
        JSON.stringify(currentComparable) !== JSON.stringify(initialComparable);

  const titleReady =
    Boolean(currentComparable.title) ||
    (mode === "edit" && currentComparable.title === initialComparable.title);
  const categoryReady =
    categoryOptions.length > 0 &&
    (Boolean(currentComparable.category.trim()) ||
      (mode === "edit" &&
        currentComparable.category === initialComparable.category));
  const longDescriptionReady =
    Boolean(currentComparable.longDescription) ||
    (mode === "edit" &&
      currentComparable.longDescription === initialComparable.longDescription);
  const organizadorReady =
    Boolean(currentComparable.organizador) ||
    (mode === "edit" &&
      currentComparable.organizador === initialComparable.organizador);
  const dateReady =
    Boolean(currentComparable.date.trim()) ||
    (mode === "edit" && currentComparable.date === initialComparable.date);
  const timeReady =
    isCompleteEventTime(currentComparable.time) ||
    (mode === "edit" && currentComparable.time === initialComparable.time);
  const venueReady =
    Boolean(currentComparable.venue) ||
    (mode === "edit" && currentComparable.venue === initialComparable.venue);
  const direccionReady =
    Boolean(currentComparable.direccion) ||
    (mode === "edit" &&
      currentComparable.direccion === initialComparable.direccion);
  const provinciaReady =
    Boolean(currentComparable.provincia.trim()) ||
    (mode === "edit" &&
      currentComparable.provincia === initialComparable.provincia);
  const localidadReady =
    Boolean(currentComparable.localidad.trim()) ||
    (mode === "edit" &&
      currentComparable.localidad === initialComparable.localidad);
  const flyerReady = Boolean(currentComparable.flyer);

  const baseCanSubmit =
    categoryOptions.length > 0 &&
    titleReady &&
    categoryReady &&
    longDescriptionReady &&
    organizadorReady &&
    dateReady &&
    timeReady &&
    venueReady &&
    direccionReady &&
    provinciaReady &&
    localidadReady &&
    flyerReady;

  const canSubmit = baseCanSubmit && hasChanges;
  const firstMissingField = useMemo(() => {
    if (!titleReady) return "Título";
    if (!categoryReady) {
      return "Categoría";
    }
    if (!longDescriptionReady) return "Descripción larga";
    if (!organizadorReady) return "Nombre del organizador";
    if (!dateReady) return "Fecha";
    if (!timeReady) return "Hora";
    if (!venueReady) return "Locación";
    if (!direccionReady) return "Dirección";
    if (!provinciaReady) return "Provincia";
    if (!localidadReady) return "Localidad";
    if (!flyerReady) return "Flyer / Poster del evento";
    return "";
  }, [
    categoryReady,
    dateReady,
    direccionReady,
    flyerReady,
    localidadReady,
    longDescriptionReady,
    organizadorReady,
    provinciaReady,
    timeReady,
    titleReady,
    venueReady,
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

    const submitOptions: AdminEventFormSubmitOptions = {};
    if (showOrganizerSelector && assignedOrganizerId) {
      submitOptions.organizadorId = assignedOrganizerId;
    }

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
      mercadoPagoId: mercadoPagoId.trim(),
    }, submitOptions);
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
          Información del evento
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
          Imágenes y flyer
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
          {showOrganizerSelector && (
            <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                {renderFieldLabel("Asignar a organizador", { optional: true })}
              </label>
              <select
                value={assignedOrganizerId}
                onChange={(e) => handleAssignedOrganizerChange(e.target.value)}
                style={inputStyle}
                disabled={organizersLoading}
              >
                <option value="">Crear como admin (yo)</option>
                {(organizers ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombreCompleto
                      ? `${item.nombreCompleto} - ${item.email}`
                      : item.email}
                  </option>
                ))}
              </select>
              {organizersLoading && (
                <span
                  style={{
                    fontSize: "var(--font-xs)",
                    color: "var(--text-disabled)",
                  }}
                >
                  Cargando organizadores...
                </span>
              )}
              {selectedOrganizer && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #e3d7a7",
                    background: "#fff8e1",
                    color: "#5b4a00",
                    fontSize: "var(--font-xs)",
                    lineHeight: 1.4,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <span>
                    El evento quedará a nombre de{" "}
                    <strong>
                      {selectedOrganizer.nombreCompleto || selectedOrganizer.email}
                    </strong>
                    . Para recibir pagos con Mercado Pago, el organizador tiene
                    que iniciar sesión y conectar su cuenta desde su panel.
                  </span>
                  {organizerPanelUrl && (
                    <button
                      type="button"
                      onClick={handleCopyPanelLink}
                      style={{
                        alignSelf: "flex-start",
                        border: "1px solid #d6c48a",
                        background: "#ffffff",
                        color: "#5b4a00",
                        borderRadius: "var(--radius-md)",
                        padding: "0.375rem 0.625rem",
                        fontSize: "var(--font-xs)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copiedPanelLink
                        ? "Link copiado"
                        : "Copiar link del panel"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={fieldBox}>
            <label style={labelStyle}>
              {renderFieldLabel("Título", { required: true })}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Festival Andino de Otoño"
            />
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
                Agrega categorías desde el panel de admin para poder crear
                eventos.
              </span>
            )}
          </div>

          <div style={{ ...fieldBox, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              {renderFieldLabel("Descripción larga", { required: true })}
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              style={textAreaStyle}
              placeholder="Contale al público de qué se trata el evento, quiénes participan, desde qué hora se puede ingresar y cualquier detalle importante para la compra."
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
              Este nombre se muestra en la app, tickets y compras. Puede ser
              distinto del usuario dueño del evento.
            </span>
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
              {renderFieldLabel("Locación", { required: true })}
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
              {renderFieldLabel("Dirección", { required: true })}
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
            <input
              value="Mercado Pago"
              disabled
              style={inputStyle}
            />
          </div>
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
                  ? "Vista previa actual"
                  : "Vista previa"}
              </span>
              <div style={previewGridStyle}>
                {flyer.trim() && (
                  <div style={previewThumbWrap}>
                    <div
                      style={{
                        ...previewThumbFrame,
                        width: "48px",
                        height: "60px",
                      }}
                    >
                      <Image
                        src={flyer}
                        alt=""
                        fill
                        sizes="48px"
                        aria-hidden="true"
                        style={{
                          objectFit: "cover",
                          filter: "blur(8px)",
                          transform: "scale(1.16)",
                          opacity: 0.62,
                        }}
                      />
                      <Image
                        src={flyer}
                        alt="Preview flyer"
                        fill
                        sizes="48px"
                        style={{
                          objectFit: "contain",
                          zIndex: 1,
                        }}
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
                      title="Eliminar flyer"
                      onClick={() => {
                        setPendingAssetRemoval("flyer");
                      }}
                    >
                      <EvaIcon name="trash-2-outline" size={16} />
                      Eliminar
                    </button>
                  </div>
                )}

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
                        alt="Preview banner"
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
                      title="Eliminar banner"
                      onClick={() => {
                        setPendingAssetRemoval("image");
                      }}
                    >
                      <EvaIcon name="trash-2-outline" size={16} />
                      Eliminar
                    </button>
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
                  : "Subí una imagen principal del evento. Recomendado: 4:5, JPG o PNG"}
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
            {`${firstMissingField} es obligatorio.`}
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

      {pendingAssetRemoval && (
        <AppConfirmDialog
          title={
            pendingAssetRemoval === "flyer"
              ? "Eliminar flyer del evento"
              : "Eliminar imagen del evento"
          }
          description={
            <>
              <p>
                {pendingAssetRemoval === "flyer"
                  ? "Vas a quitar el flyer actual del evento."
                  : "Vas a quitar la imagen actual del evento."}
              </p>
              <p>
                El flyer es obligatorio para guardar. El banner del carrusel es
                opcional.
              </p>
            </>
          }
          confirmLabel="Eliminar"
          iconName="trash"
          onConfirm={handleConfirmAssetRemoval}
          onClose={() => setPendingAssetRemoval(null)}
        />
      )}
    </form>
  );
}

