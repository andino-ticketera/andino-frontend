export interface Organizer {
  id: string;
  nombre: string;
  apellido: string;
  empresa: string;
  email: string;
  telefono: string;
}

export const currentOrganizer: Organizer = {
  id: "org-1",
  nombre: "Carlos",
  apellido: "Mendez",
  empresa: "Bai Bai Producciones",
  email: "carlos@baibai.com",
  telefono: "+5491155551234",
};
