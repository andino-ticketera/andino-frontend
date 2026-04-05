export const provincias = [
  "Tucuman",
  "Buenos Aires",
  "Cordoba",
  "Mendoza",
  "Santa Fe",
  "Salta",
  "Jujuy",
  "Santiago del Estero",
  "Catamarca",
] as const;

export const localidades: Record<string, string[]> = {
  Tucuman: [
    "San Miguel de Tucuman",
    "Yerba Buena",
    "Tafi del Valle",
    "Concepcion",
  ],
  "Buenos Aires": ["CABA", "La Plata", "Mar del Plata", "Tigre"],
  Cordoba: ["Cordoba Capital", "Villa Carlos Paz", "Alta Gracia"],
  Mendoza: ["Mendoza Capital", "San Rafael", "Malargue"],
  "Santa Fe": ["Rosario", "Santa Fe Capital"],
  Salta: ["Salta Capital", "Cafayate"],
  Jujuy: ["San Salvador de Jujuy", "Tilcara", "Purmamarca"],
  "Santiago del Estero": ["Santiago Capital", "Termas de Rio Hondo"],
  Catamarca: ["San Fernando del Valle"],
};
