export interface Purchase {
  id: string;
  userId?: string | null;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  firstName: string;
  lastName: string;
  dniType: string;
  dniNumber: string;
  email: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: "TRANSFERENCIA_CBU" | "MERCADO_PAGO";
  status: "PENDIENTE" | "PAGADO" | "CANCELADO";
  purchaseDate: string;
  checkedInCount: number;
}
