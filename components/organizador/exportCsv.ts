import type { Purchase } from "@/data/purchases";
import {
  formatManagedPurchaseDate,
  getManagedPaymentMethodLabel,
  getPurchaseCheckInLabel,
} from "@/lib/managed-purchases-api";

export function downloadBuyersCsv(
  purchases: Purchase[],
  eventTitle: string,
): void {
  const headers = [
    "Nombre",
    "Apellido",
    "Tipo Doc",
    "Nro Doc",
    "Email",
    "Cantidad",
    "Precio Unitario",
    "Total",
    "Metodo Pago",
    "Estado",
    "Fecha",
    "Check-in",
  ];

  const rows = purchases.map((p) =>
    [
      p.firstName,
      p.lastName,
      p.dniType,
      p.dniNumber,
      p.email,
      p.quantity,
      p.unitPrice.toFixed(2),
      p.totalPrice.toFixed(2),
      getManagedPaymentMethodLabel(p.paymentMethod),
      p.status,
      formatManagedPurchaseDate(p.purchaseDate),
      getPurchaseCheckInLabel(p),
    ].join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const slug = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
  const date = new Date().toISOString().split("T")[0];

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `compradores-${slug}-${date}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
