export interface Purchase {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  dniType: string;
  dniNumber: string;
  email: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: "transferencia" | "mercadopago";
  purchaseDate: string;
  checkedIn?: boolean;
}

export const purchases: Purchase[] = [
  { id: "p1", eventId: "1", firstName: "Juan", lastName: "Perez", dniType: "DNI", dniNumber: "35678901", email: "juan@email.com", quantity: 2, unitPrice: 0, totalPrice: 0, paymentMethod: "mercadopago", purchaseDate: "2026-03-25" },
  { id: "p2", eventId: "2", firstName: "Maria", lastName: "Gonzalez", dniType: "DNI", dniNumber: "30123456", email: "maria@email.com", quantity: 3, unitPrice: 65, totalPrice: 195, paymentMethod: "mercadopago", purchaseDate: "2026-03-24" },
  { id: "p3", eventId: "5", firstName: "Carlos", lastName: "Lopez", dniType: "DNI", dniNumber: "28456789", email: "carlos@email.com", quantity: 1, unitPrice: 30, totalPrice: 30, paymentMethod: "transferencia", purchaseDate: "2026-03-23" },
  { id: "p4", eventId: "10", firstName: "Ana", lastName: "Martinez", dniType: "DNI", dniNumber: "33789012", email: "ana@email.com", quantity: 4, unitPrice: 80, totalPrice: 320, paymentMethod: "mercadopago", purchaseDate: "2026-03-22" },
  { id: "p5", eventId: "12", firstName: "Lucas", lastName: "Fernandez", dniType: "DNI", dniNumber: "36012345", email: "lucas@email.com", quantity: 2, unitPrice: 90, totalPrice: 180, paymentMethod: "mercadopago", purchaseDate: "2026-03-21" },
  { id: "p6", eventId: "2", firstName: "Sofia", lastName: "Rodriguez", dniType: "DNI", dniNumber: "34567890", email: "sofia@email.com", quantity: 2, unitPrice: 65, totalPrice: 130, paymentMethod: "transferencia", purchaseDate: "2026-03-20" },
  { id: "p7", eventId: "13", firstName: "Martin", lastName: "Garcia", dniType: "DNI", dniNumber: "31234567", email: "martin@email.com", quantity: 3, unitPrice: 35, totalPrice: 105, paymentMethod: "mercadopago", purchaseDate: "2026-03-19" },
  { id: "p8", eventId: "4", firstName: "Valentina", lastName: "Diaz", dniType: "DNI", dniNumber: "37890123", email: "vale@email.com", quantity: 2, unitPrice: 25, totalPrice: 50, paymentMethod: "mercadopago", purchaseDate: "2026-03-18" },
  { id: "p9", eventId: "7", firstName: "Nicolas", lastName: "Alvarez", dniType: "DNI", dniNumber: "29345678", email: "nico@email.com", quantity: 1, unitPrice: 20, totalPrice: 20, paymentMethod: "transferencia", purchaseDate: "2026-03-17" },
  { id: "p10", eventId: "10", firstName: "Camila", lastName: "Romero", dniType: "DNI", dniNumber: "32678901", email: "camila@email.com", quantity: 2, unitPrice: 80, totalPrice: 160, paymentMethod: "mercadopago", purchaseDate: "2026-03-16" },
  { id: "p11", eventId: "5", firstName: "Tomas", lastName: "Herrera", dniType: "DNI", dniNumber: "35901234", email: "tomas@email.com", quantity: 2, unitPrice: 30, totalPrice: 60, paymentMethod: "mercadopago", purchaseDate: "2026-03-15" },
  { id: "p12", eventId: "15", firstName: "Lucia", lastName: "Sosa", dniType: "DNI", dniNumber: "33012345", email: "lucia@email.com", quantity: 1, unitPrice: 70, totalPrice: 70, paymentMethod: "transferencia", purchaseDate: "2026-03-14" },
  { id: "p13", eventId: "9", firstName: "Mateo", lastName: "Torres", dniType: "DNI", dniNumber: "30567890", email: "mateo@email.com", quantity: 2, unitPrice: 15, totalPrice: 30, paymentMethod: "mercadopago", purchaseDate: "2026-03-13" },
  { id: "p14", eventId: "12", firstName: "Florencia", lastName: "Castro", dniType: "DNI", dniNumber: "34890123", email: "flor@email.com", quantity: 3, unitPrice: 90, totalPrice: 270, paymentMethod: "mercadopago", purchaseDate: "2026-03-12" },
  { id: "p15", eventId: "6", firstName: "Santiago", lastName: "Moreno", dniType: "DNI", dniNumber: "28123456", email: "santi@email.com", quantity: 2, unitPrice: 45, totalPrice: 90, paymentMethod: "transferencia", purchaseDate: "2026-03-11" },
  { id: "p16", eventId: "2", firstName: "Agustina", lastName: "Ruiz", dniType: "DNI", dniNumber: "36345678", email: "agus@email.com", quantity: 1, unitPrice: 65, totalPrice: 65, paymentMethod: "mercadopago", purchaseDate: "2026-03-10" },
  { id: "p17", eventId: "10", firstName: "Franco", lastName: "Medina", dniType: "DNI", dniNumber: "31678901", email: "franco@email.com", quantity: 2, unitPrice: 80, totalPrice: 160, paymentMethod: "mercadopago", purchaseDate: "2026-03-09" },
  { id: "p18", eventId: "13", firstName: "Julieta", lastName: "Acosta", dniType: "DNI", dniNumber: "33456789", email: "juli@email.com", quantity: 2, unitPrice: 35, totalPrice: 70, paymentMethod: "transferencia", purchaseDate: "2026-03-08" },
  { id: "p19", eventId: "5", firstName: "Ignacio", lastName: "Flores", dniType: "DNI", dniNumber: "29789012", email: "nacho@email.com", quantity: 1, unitPrice: 30, totalPrice: 30, paymentMethod: "mercadopago", purchaseDate: "2026-03-07" },
  { id: "p20", eventId: "12", firstName: "Martina", lastName: "Gutierrez", dniType: "DNI", dniNumber: "35234567", email: "martina@email.com", quantity: 2, unitPrice: 90, totalPrice: 180, paymentMethod: "mercadopago", purchaseDate: "2026-03-06" },
  { id: "p21", eventId: "org-ev-1", firstName: "Diego", lastName: "Ramirez", dniType: "DNI", dniNumber: "34567123", email: "diego@email.com", quantity: 2, unitPrice: 40, totalPrice: 80, paymentMethod: "mercadopago", purchaseDate: "2026-03-26" },
  { id: "p22", eventId: "org-ev-1", firstName: "Paula", lastName: "Vega", dniType: "DNI", dniNumber: "31890456", email: "paula@email.com", quantity: 3, unitPrice: 40, totalPrice: 120, paymentMethod: "mercadopago", purchaseDate: "2026-03-25", checkedIn: true },
  { id: "p23", eventId: "org-ev-1", firstName: "Roberto", lastName: "Sanchez", dniType: "DNI", dniNumber: "29012345", email: "roberto@email.com", quantity: 1, unitPrice: 40, totalPrice: 40, paymentMethod: "mercadopago", purchaseDate: "2026-03-24" },
  { id: "p24", eventId: "org-ev-2", firstName: "Cecilia", lastName: "Blanco", dniType: "DNI", dniNumber: "33456012", email: "ceci@email.com", quantity: 2, unitPrice: 25, totalPrice: 50, paymentMethod: "transferencia", purchaseDate: "2026-03-27" },
  { id: "p25", eventId: "org-ev-2", firstName: "Andres", lastName: "Molina", dniType: "DNI", dniNumber: "30789345", email: "andres@email.com", quantity: 4, unitPrice: 25, totalPrice: 100, paymentMethod: "mercadopago", purchaseDate: "2026-03-26" },
  { id: "p26", eventId: "org-ev-2", firstName: "Laura", lastName: "Paz", dniType: "DNI", dniNumber: "36123890", email: "laura@email.com", quantity: 2, unitPrice: 25, totalPrice: 50, paymentMethod: "mercadopago", purchaseDate: "2026-03-25", checkedIn: true },
  { id: "p27", eventId: "org-ev-1", firstName: "Emilio", lastName: "Suarez", dniType: "DNI", dniNumber: "28345012", email: "emilio@email.com", quantity: 2, unitPrice: 40, totalPrice: 80, paymentMethod: "mercadopago", purchaseDate: "2026-03-23" },
  { id: "p28", eventId: "org-ev-2", firstName: "Marina", lastName: "Rios", dniType: "DNI", dniNumber: "35678234", email: "marina@email.com", quantity: 1, unitPrice: 25, totalPrice: 25, paymentMethod: "transferencia", purchaseDate: "2026-03-22" },
];
