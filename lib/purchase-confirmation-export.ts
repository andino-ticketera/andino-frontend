"use client";

import { jsPDF } from "jspdf";
import type { PublicCheckoutStatus } from "@/lib/mercadopago-api";

type ExportFormat = "png" | "jpg" | "pdf";

function formatPrice(value: number): string {
  return `$${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value))}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: PublicCheckoutStatus["estado"]): string {
  if (status === "PAGADO") return "Pagado";
  if (status === "CANCELADO") return "Cancelado";
  return "Pendiente";
}

function getStatusColor(status: PublicCheckoutStatus["estado"]): string {
  if (status === "PAGADO") return "#0f9f6e";
  if (status === "CANCELADO") return "#dc2626";
  return "#c27a12";
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
  return `confirmacion-${eventSlug}-${data.compraId}.${format}`;
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
): void {
  roundedRectPath(ctx, x, y, width, height, radius);
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

function drawValueBlock(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): void {
  ctx.fillStyle = "#5b6573";
  ctx.font = "600 26px Arial";
  ctx.fillText(label, x, y);

  ctx.fillStyle = "#102033";
  ctx.font = "700 30px Arial";

  const lines = wrapText(ctx, value, width);
  let lineY = y + 46;
  for (const line of lines) {
    ctx.fillText(line, x, lineY);
    lineY += 38;
  }
}

function buildConfirmationCanvas(data: PublicCheckoutStatus): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar la confirmación");
  }

  ctx.fillStyle = "#eef3f8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(240, 120, 60, 240, 120, 520);
  glow.addColorStop(0, "rgba(16,185,129,0.22)");
  glow.addColorStop(1, "rgba(16,185,129,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const topBand = ctx.createLinearGradient(0, 0, canvas.width, 0);
  topBand.addColorStop(0, "#0f9f6e");
  topBand.addColorStop(1, "#56d5a6");
  ctx.fillStyle = topBand;
  ctx.fillRect(0, 0, canvas.width, 176);

  ctx.shadowColor = "rgba(15,23,42,0.10)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  fillRoundedRect(ctx, 110, 104, 1380, 988, 40, "#ffffff");
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  fillRoundedRect(ctx, 170, 170, 270, 58, 29, "#e9fff5");
  ctx.fillStyle = "#0f9f6e";
  ctx.font = "700 24px Arial";
  ctx.fillText("Andino Tickets", 214, 208);

  ctx.fillStyle = "#102033";
  ctx.font = "800 60px Arial";
  ctx.fillText("Confirmación de compra", 170, 308);

  ctx.fillStyle = "#203247";
  ctx.font = "700 34px Arial";
  const titleLines = wrapText(ctx, data.eventoTitulo, 900);
  let currentTitleY = 382;
  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, 170, currentTitleY);
    currentTitleY += 44;
  }

  fillRoundedRect(ctx, 1160, 232, 230, 92, 24, "#f8fafc");
  strokeRoundedRect(ctx, 1160, 232, 230, 92, 24, "#d9e2ec");
  ctx.fillStyle = "#6a7482";
  ctx.font = "600 20px Arial";
  ctx.fillText("Estado", 1192, 268);
  ctx.fillStyle = getStatusColor(data.estado);
  ctx.font = "800 32px Arial";
  ctx.fillText(getStatusLabel(data.estado), 1192, 308);

  fillRoundedRect(ctx, 170, 482, 1260, 1, 0, "#e6ebf1");

  drawValueBlock(ctx, "Fecha", formatDate(data.createdAt), 170, 572, 520);
  drawValueBlock(
    ctx,
    "Cantidad",
    `${data.cantidad} ${data.cantidad === 1 ? "entrada" : "entradas"}`,
    860,
    572,
    430,
  );
  drawValueBlock(ctx, "Total", formatPrice(data.total), 170, 768, 520);
  drawValueBlock(ctx, "Email", data.compradorEmail, 860, 768, 430);

  fillRoundedRect(ctx, 170, 934, 1260, 122, 28, "#f8fafc");
  strokeRoundedRect(ctx, 170, 934, 1260, 122, 28, "#d9e2ec");
  ctx.fillStyle = "#5b6573";
  ctx.font = "600 22px Arial";
  ctx.fillText("ID de compra", 214, 985);
  ctx.fillStyle = "#102033";
  ctx.font = "700 24px Arial";
  ctx.fillText(data.compraId, 214, 1028);

  ctx.fillStyle = "#5b6573";
  ctx.font = "500 20px Arial";
  ctx.fillText(
    "Este archivo resume el estado actual de tu compra en Andino Tickets.",
    170,
    1128,
  );

  return canvas;
}

export async function downloadPurchaseConfirmation(
  data: PublicCheckoutStatus,
  format: ExportFormat,
): Promise<void> {
  const canvas = buildConfirmationCanvas(data);
  const filename = buildFilename(data, format);

  if (format === "png") {
    const blob = await canvasToBlob(canvas, "image/png");
    triggerDownload(blob, filename);
    return;
  }

  if (format === "jpg") {
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    triggerDownload(blob, filename);
    return;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const image = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const renderWidth = pageWidth - margin * 2;
  const renderHeight = (canvas.height / canvas.width) * renderWidth;
  const fittedHeight = Math.min(renderHeight, pageHeight - margin * 2);
  const offsetY = (pageHeight - fittedHeight) / 2;

  pdf.addImage(image, "PNG", margin, offsetY, renderWidth, fittedHeight);
  pdf.save(filename);
}
