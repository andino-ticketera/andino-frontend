"use client";

import { jsPDF } from "jspdf";
import {
  formatEventDateTime,
  formatPurchaseDateTime,
} from "@/lib/date-format";
import type { PublicCheckoutStatus } from "@/lib/mercadopago-api";

type ExportFormat = "jpg" | "pdf";

const PALETTE = {
  base: "#2a1342",
  footer: "#1e0d33",
  surface1: "#331a52",
  surface2: "#3b2161",
  surface3: "#432872",
  border: "#3a2a5a",
  primary: "#5cff9d",
  accent: "#ff4fdc",
  text: "#ffffff",
  textSecondary: "#e2dcf0",
  textMuted: "#b0a3c7",
  success: "#5cff9d",
  danger: "#ff8ba7",
  warning: "#ffd166",
  darkInk: "#04110d",
};

function formatPrice(value: number): string {
  return `$${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value))}`;
}

function formatDateStamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getStatusMeta(status: PublicCheckoutStatus["estado"]): {
  label: string;
  color: string;
} {
  if (status === "PAGADO") {
    return {
      label: "Pago acreditado",
      color: PALETTE.success,
    };
  }

  if (status === "CANCELADO") {
    return {
      label: "Pago cancelado",
      color: PALETTE.danger,
    };
  }

  return {
    label: "Pago pendiente",
    color: PALETTE.warning,
  };
}

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildFilename(data: PublicCheckoutStatus, format: ExportFormat): string {
  const eventSlug = sanitizeFilename(data.eventoTitulo) || "compra";
  const dateStamp = formatDateStamp(data.createdAt);
  const suffix = dateStamp ? `-${dateStamp}` : "";
  return `confirmacion-${eventSlug}${suffix}.${format}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la descarga"));
        return;
      }

      resolve(blob);
    }, mimeType, quality);
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth = 1,
): void {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let currentLine = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${currentLine} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  lines.push(currentLine);
  return lines;
}

function drawMetricCard(
  ctx: CanvasRenderingContext2D,
  input: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    value: string;
    valueColor?: string;
  },
): void {
  fillRoundedRect(
    ctx,
    input.x,
    input.y,
    input.width,
    input.height,
    32,
    PALETTE.surface2,
  );
  strokeRoundedRect(
    ctx,
    input.x,
    input.y,
    input.width,
    input.height,
    32,
    PALETTE.border,
    2,
  );

  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = "700 24px Arial";
  ctx.fillText(input.label, input.x + 34, input.y + 52);

  ctx.fillStyle = input.valueColor || PALETTE.text;
  ctx.font = "800 46px Arial";

  const lines = wrapText(ctx, input.value, input.width - 68);
  let currentY = input.y + 112;
  for (const line of lines.slice(0, 2)) {
    ctx.fillText(line, input.x + 34, currentY);
    currentY += 54;
  }
}

function drawDetailRow(
  ctx: CanvasRenderingContext2D,
  input: {
    x: number;
    y: number;
    width: number;
    label: string;
    value: string;
    fill: string;
  },
): number {
  const paddingX = 34;
  const paddingTop = 30;
  const labelWidth = 300;
  const valueWidth = input.width - paddingX * 2 - labelWidth;

  ctx.font = "700 34px Arial";
  const valueLines = wrapText(ctx, input.value, valueWidth);
  const lineHeight = 42;
  const valueHeight = valueLines.length * lineHeight;
  const rowHeight = Math.max(108, paddingTop * 2 + valueHeight);

  fillRoundedRect(
    ctx,
    input.x,
    input.y,
    input.width,
    rowHeight,
    28,
    input.fill,
  );
  strokeRoundedRect(
    ctx,
    input.x,
    input.y,
    input.width,
    rowHeight,
    28,
    PALETTE.border,
    2,
  );

  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = "700 24px Arial";
  ctx.fillText(input.label, input.x + paddingX, input.y + 46);

  ctx.fillStyle = PALETTE.text;
  ctx.font = "700 34px Arial";

  let textY = input.y + 52;
  for (const line of valueLines) {
    ctx.fillText(line, input.x + paddingX + labelWidth, textY);
    textY += lineHeight;
  }

  return input.y + rowHeight;
}

function buildConfirmationCanvas(data: PublicCheckoutStatus): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 2546;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar la confirmación");
  }

  const statusMeta = getStatusMeta(data.estado);
  const details = [
    { label: "Evento", value: data.eventoTitulo },
    { label: "Fecha del evento", value: formatEventDateTime(data.eventDate) },
    { label: "Estado", value: statusMeta.label },
    { label: "Compra realizada", value: formatPurchaseDateTime(data.createdAt) },
    { label: "Comprador", value: data.compradorEmail },
    {
      label: "Entradas",
      value: `${data.cantidad} ${data.cantidad === 1 ? "entrada" : "entradas"}`,
    },
    { label: "Total", value: formatPrice(data.total) },
  ];

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, PALETTE.base);
  background.addColorStop(1, PALETTE.footer);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const greenGlow = ctx.createRadialGradient(320, 220, 60, 320, 220, 760);
  greenGlow.addColorStop(0, "rgba(92,255,157,0.22)");
  greenGlow.addColorStop(1, "rgba(92,255,157,0)");
  ctx.fillStyle = greenGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pinkGlow = ctx.createRadialGradient(
    canvas.width - 240,
    canvas.height - 240,
    80,
    canvas.width - 240,
    canvas.height - 240,
    720,
  );
  pinkGlow.addColorStop(0, "rgba(255,79,220,0.18)");
  pinkGlow.addColorStop(1, "rgba(255,79,220,0)");
  ctx.fillStyle = pinkGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 18;
  fillRoundedRect(
    ctx,
    92,
    92,
    canvas.width - 184,
    canvas.height - 184,
    48,
    PALETTE.surface1,
  );
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  strokeRoundedRect(
    ctx,
    92,
    92,
    canvas.width - 184,
    canvas.height - 184,
    48,
    PALETTE.border,
    2,
  );

  fillRoundedRect(ctx, 136, 136, canvas.width - 272, 10, 5, PALETTE.accent);

  fillRoundedRect(ctx, 156, 174, 304, 74, 37, "rgba(92,255,157,0.14)");
  strokeRoundedRect(
    ctx,
    156,
    174,
    304,
    74,
    37,
    "rgba(92,255,157,0.34)",
    2,
  );
  ctx.fillStyle = PALETTE.primary;
  ctx.font = "800 28px Arial";
  ctx.fillText("Andino Tickets", 192, 221);

  fillRoundedRect(ctx, 1284, 170, 360, 116, 34, PALETTE.surface2);
  strokeRoundedRect(ctx, 1284, 170, 360, 116, 34, PALETTE.border, 2);
  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = "700 22px Arial";
  ctx.fillText("Estado actual", 1318, 214);
  ctx.fillStyle = statusMeta.color;
  ctx.font = "800 38px Arial";
  ctx.fillText(statusMeta.label, 1318, 264);

  ctx.fillStyle = PALETTE.text;
  ctx.font = "800 86px Arial";
  ctx.fillText("Confirmación de compra", 156, 368);

  ctx.fillStyle = PALETTE.textSecondary;
  ctx.font = "600 30px Arial";
  ctx.fillText(
    "Comprobante digital generado desde Andino Tickets",
    156,
    428,
  );

  fillRoundedRect(
    ctx,
    156,
    462,
    canvas.width - 312,
    118,
    32,
    "rgba(92,255,157,0.12)",
  );
  strokeRoundedRect(
    ctx,
    156,
    462,
    canvas.width - 312,
    118,
    32,
    "rgba(92,255,157,0.26)",
    2,
  );
  ctx.fillStyle = PALETTE.primary;
  ctx.font = "800 24px Arial";
  ctx.fillText("Fecha y hora del evento", 190, 508);
  ctx.fillStyle = PALETTE.text;
  ctx.font = "800 40px Arial";
  ctx.fillText(formatEventDateTime(data.eventDate), 190, 555);

  ctx.fillStyle = PALETTE.text;
  ctx.font = "800 58px Arial";
  const titleLines = wrapText(ctx, data.eventoTitulo, 1200);
  let titleY = 670;
  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, 156, titleY);
    titleY += 68;
  }

  const metricY = 854;
  drawMetricCard(ctx, {
    x: 156,
    y: metricY,
    width: 440,
    height: 190,
    label: "Estado",
    value: statusMeta.label,
    valueColor: statusMeta.color,
  });
  drawMetricCard(ctx, {
    x: 680,
    y: metricY,
    width: 440,
    height: 190,
    label: "Entradas",
    value: `${data.cantidad}`,
  });
  drawMetricCard(ctx, {
    x: 1204,
    y: metricY,
    width: 440,
    height: 190,
    label: "Total",
    value: formatPrice(data.total),
    valueColor: PALETTE.primary,
  });

  fillRoundedRect(
    ctx,
    156,
    1112,
    canvas.width - 312,
    1166,
    40,
    PALETTE.base,
  );
  strokeRoundedRect(
    ctx,
    156,
    1112,
    canvas.width - 312,
    1166,
    40,
    PALETTE.border,
    2,
  );

  ctx.fillStyle = PALETTE.primary;
  ctx.font = "800 30px Arial";
  ctx.fillText("Detalle de la compra", 198, 1180);

  ctx.fillStyle = PALETTE.textSecondary;
  ctx.font = "600 24px Arial";
  ctx.fillText(
    "Incluye los datos principales de la operación para guardarlo o compartirlo.",
    198,
    1228,
  );

  let currentY = 1282;
  details.forEach((detail, index) => {
    currentY =
      drawDetailRow(ctx, {
        x: 198,
        y: currentY,
        width: canvas.width - 396,
        label: detail.label,
        value: detail.value,
        fill: index % 2 === 0 ? PALETTE.surface2 : PALETTE.surface3,
      }) + 22;
  });

  fillRoundedRect(
    ctx,
    198,
    2108,
    canvas.width - 396,
    96,
    28,
    "rgba(92,255,157,0.12)",
  );
  strokeRoundedRect(
    ctx,
    198,
    2108,
    canvas.width - 396,
    96,
    28,
    "rgba(92,255,157,0.26)",
    2,
  );
  ctx.fillStyle = PALETTE.primary;
  ctx.font = "700 24px Arial";
  ctx.fillText("Andino Tickets", 234, 2165);
  ctx.fillStyle = PALETTE.textSecondary;
  ctx.font = "600 24px Arial";
  ctx.fillText(
    "Comprobante listo para guardar en tu celular o compartirlo cuando lo necesites.",
    454,
    2165,
  );

  return canvas;
}

export async function downloadPurchaseConfirmation(
  data: PublicCheckoutStatus,
  format: ExportFormat,
): Promise<void> {
  const canvas = buildConfirmationCanvas(data);
  const filename = buildFilename(data, format);

  if (format === "jpg") {
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
    triggerDownload(blob, filename);
    return;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const image = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const renderWidth = pageWidth - margin * 2;
  const renderHeight = (canvas.height / canvas.width) * renderWidth;
  const offsetY = (pageHeight - renderHeight) / 2;

  pdf.addImage(image, "PNG", margin, offsetY, renderWidth, renderHeight);
  pdf.save(filename);
}
