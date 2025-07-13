export type LatLng = {
  lat: number;
  lng: number;
};

export type MapMarker = {
  label: string;
  location: LatLng;
  icon: string;
};

export type MapLayer = {
  label: string;
  markers: Record<string, MapMarker>;
};

export type Stat = {
  field: string;
};

export type LabeledValue = {
  nombre: string;
  codigo: string;
};

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
};

export type RegionStats = {
  tipo_region: string;
  codigo: string;
  nombre: string;
  estadisticas_propiedades: {
    n: number;
    area_q1: number;
    area_q3: number;
    area_promedio: number;
    avaluo_cat_q1: number;
    avaluo_cat_q3: number;
    avaluo_com_q1: number;
    avaluo_com_q3: number;
    banos_promedio: number;
    avaluo_cat_promedio: number;
    avaluo_com_promedio: number;
    habitaciones_stddev: number;
    habitaciones_promedio: number;
  };
};

export type PropertyData = {
  lat: number;
  lng: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  age: number;
};

export type EstimationResponse = {
  geohash: string;
  center: {
    lat: number;
    lng: number;
  };
  region_info: Record<string, LabeledValue>;
  nearby_places: Record<string, Record<string, Place[]>>;
  valuation: Record<string, number>;
  calculation_time_seconds: number;
  estimation: {
    minValue: number;
    average: number;
    maxValue: number;
  };
  region_stats: RegionStats[];
  property_data: PropertyData;
};

export type EstimationResult = {
  geohash: string;
  estimation: {
    minValue: number;
    average: number;
    maxValue: number;
  };
  regionInfo: Record<string, { nombre: string; codigo: string }>;
  location: LatLng;
  mapLayers: Record<string, MapLayer>;
  response: EstimationResponse;
};

export const DEFAULT_POSITION: LatLng = { lat: -74.43, lng: 4.19 };
