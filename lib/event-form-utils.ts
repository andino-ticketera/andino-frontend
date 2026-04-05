import { localidades, provincias } from "@/data/locations";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const MONTH_INDEX_BY_NAME = new Map(
  MONTHS.map((month, index) => [normalizeText(month), index]),
);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

export function eventDateLabelToInputValue(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const labelMatch = trimmedValue.match(
    /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+),\s*(\d{4})$/,
  );
  if (!labelMatch) return "";

  const day = Number(labelMatch[1]);
  const month = MONTH_INDEX_BY_NAME.get(normalizeText(labelMatch[2]));
  const year = Number(labelMatch[3]);

  if (month === undefined) return "";

  return `${year}-${padNumber(month + 1)}-${padNumber(day)}`;
}

export function eventDateInputToLabel(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return trimmedValue;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (month < 0 || month > 11) return trimmedValue;

  return `${day} ${MONTHS[month]}, ${year}`;
}

export function normalizeEventTimeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length <= 2) {
    const hourOnly = Number(digits);
    if (Number.isNaN(hourOnly)) return "";
    return String(Math.min(hourOnly, 23)).padStart(digits.length, "0");
  }

  if (digits.length === 3) {
    const rawHour = Number(digits.slice(0, 2));
    if (Number.isNaN(rawHour)) return "";

    const hour = Math.min(rawHour, 23);
    return `${padNumber(hour)}:${digits[2]}`;
  }

  const rawHour = Number(digits.slice(0, 2));
  const rawMinute = Number(digits.slice(2, 4));

  if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return "";

  const hour = Math.min(rawHour, 23);
  const minute = Math.min(rawMinute, 59);
  return `${padNumber(hour)}:${padNumber(minute)}`;
}

export function isCompleteEventTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function getEventTimePeriod(value: string): "AM" | "PM" | "" {
  const normalizedValue = normalizeEventTimeInput(value);
  const match = normalizedValue.match(/^(\d{2}):(\d{2})$/);
  if (!match) return "";

  const hour = Number(match[1]);
  if (Number.isNaN(hour)) return "";

  return hour < 12 ? "AM" : "PM";
}

export function matchProvinciaOption(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  return (
    provincias.find(
      (item) => normalizeText(item) === normalizeText(trimmedValue),
    ) ?? ""
  );
}

export function matchLocalidadOption(provincia: string, value: string): string {
  const trimmedValue = value.trim();
  if (!provincia || !trimmedValue) return "";

  return (
    (localidades[provincia] ?? []).find(
      (item) => normalizeText(item) === normalizeText(trimmedValue),
    ) ?? ""
  );
}
