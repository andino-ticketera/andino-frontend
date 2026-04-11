export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  venue: string;
  provincia: string;
  localidad: string;
  price: number;
  category: string;
  image: string;
  flyer: string;
  flyerPosition?: string;
  featured: boolean;
  tags: string[];
  direccion: string;
  organizador: string;
  totalEntradas: number;
  entradasVendidas: number;
  mediosDePago: "mercadopago"[];
  mercadoPagoId: string;
  creatorId?: string;
  creatorRole?: "ORGANIZADOR" | "ADMIN";
  status?: "ACTIVO" | "AGOTADO" | "CANCELADO";
  visibleInApp?: boolean;
}
