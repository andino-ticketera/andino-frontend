export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  /** Fecha del evento en ISO (para comparaciones y filtros). */
  eventDateIso?: string;
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

/**
 * Un evento se considera finalizado cuando su fecha ya paso hace mas de
 * un dia (mismo margen que usa el backend en hideFinishedEvents).
 */
export function isEventFinished(event: Pick<Event, "eventDateIso">): boolean {
  if (!event.eventDateIso) return false;
  const eventTime = new Date(event.eventDateIso).getTime();
  if (Number.isNaN(eventTime)) return false;
  const threshold = Date.now() - 24 * 60 * 60 * 1000;
  return eventTime < threshold;
}
