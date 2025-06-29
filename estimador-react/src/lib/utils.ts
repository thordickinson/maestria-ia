const LAYER_LABELS: Record<string, string> = {
  education: "Educación",
  healthcare: "Salud",
  retail_access: "Acceso a comercio",
  dining_and_entertainment: "Restaurantes y entretenimiento",
  accommodation: "Alojamiento",
  parks_and_recreation: "Parques y recreación",
  infrastructure_services: "Servicios de infraestructura",
  cultural_amenities: "Servicios culturales",
  estacion_transmilenio: "Estaciones TransMilenio",
  estacion_sitp: "Estaciones SITP",
};


export function getSiteTypeLabel(siteKey: string): string {
  return LAYER_LABELS[siteKey]?? siteKey
}