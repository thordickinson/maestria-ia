import { useSearchParams } from "react-router";
import type { EstimationResult, MapLayer } from "../lib/types";
import { useCallback, useEffect, useState } from "react";
import { groupBy } from "lodash";

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

type LabeledValue = {
  nombre: string;
  codigo: string;
};

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
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
};

const requiredParams = ["bedrooms", "age", "bathrooms", "area", "lat", "lng"];

export default function useEstimation() {
  const [response, setResponse] = useState<EstimationResponse | null>(null);
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const response = await fetch(`/api/estimate?${searchParams.toString()}`);
      if (!response.ok) {
        setError(`Error: ${response.status} ${response.statusText}`);
        return;
      }
      const data: EstimationResponse = await response.json();
      setResponse(data);
    } catch (err) {
      console.error("Error fetching estimation:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setEstimation(buildEstimation(response));
  }, [response]);

  useEffect(() => {
    if (!requiredParams.every((param) => searchParams.has(param))) {
      setError("Missing required parameters: propertyType and location");
    } else {
      estimate();
    }
  }, [searchParams, estimate]);

  return { response, loading, error, estimate, estimation };
}

function buildEstimation(response: EstimationResponse | null): EstimationResult | null {
  if (!response) return null;

  const { geohash, center, valuation, estimation, nearby_places } = response;
  const location = { lat: center.lat, lng: center.lng };

  const mapLayers: Record<string, MapLayer> = {};
  const allPlaces = Object.values(nearby_places).flatMap(p => Object.values(p).flat());
  const groupedPlaces = groupBy(allPlaces, "type");
  for (const [type, places] of Object.entries(groupedPlaces)) {
    const markers = places.reduce((acc, place) => {
      acc[place.id] = {
        label: place.name,
        location: { lat: place.lat, lng: place.lng },
        icon: type, // Assuming icons are named by type
      };
      return acc;
    }, {} as Record<string, { label: string; location: { lat: number; lng: number }; icon: string }>);
    mapLayers[type] = {
      label: LAYER_LABELS[type] || type,
      markers,
    };
  }

  
  return {
    geohash,
    estimation,
    location,
    mapLayers,
  };
}
