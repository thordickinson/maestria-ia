"use client";

import { MapContainer, Marker, TileLayer, Popup, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useEffect, useMemo, useRef } from "react";
import type { LatLng, MapLayer } from "../lib/types";
import { createMarkerIcon } from "../components/map-markers";

const DEFAULT_CENTER = {lat: 4.6482784, lng: -74.2726152}

interface MapProps {
  center?: LatLng,
  position?: LatLng;
  zoom: number;
  onMarkerLocationChanged?: (position: LatLng) => void;
  layers?: Record<string, MapLayer>;
  positionDraggable?: boolean
  className?: string
}

export default function Map({ position, center, zoom, layers = {}, onMarkerLocationChanged, positionDraggable = false, className }: MapProps) {
  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if(center || !position || !mapRef.current) return;
    mapRef.current.flyTo([position.lat, position.lng])
  }, [position])

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onMarkerLocationChanged) {
          onMarkerLocationChanged(marker.getLatLng());
        }
      },
    }),
    []
  );
  
  const resolvedCenter = center?? position ?? DEFAULT_CENTER

  return (
      <MapContainer ref={mapRef} center={resolvedCenter} zoom={zoom} className={className} scrollWheelZoom={false} attributionControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(layers).length > 0 &&
        <LayersControl position="bottomright">
          {Object.entries(layers).map(([layerKey, layer]) => (
            <LayersControl.Overlay key={layerKey} name={layer.label} checked>
              <LayerGroup>
              {Object.entries(layer.markers).map(([markerKey, marker]) => (
                <Marker key={markerKey} position={marker.location} icon={createMarkerIcon(marker.icon)}>
                  <Popup>{marker.label}</Popup>
                </Marker>
              ))}
              </LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        }
        {position && 
          <Marker ref={markerRef} position={position} draggable={positionDraggable} eventHandlers={eventHandlers} icon={createMarkerIcon("home")}>
            <Popup>Mueve el marcador para seleccionar la posición de tu inmueble</Popup>
          </Marker>
        }
      </MapContainer>
  );
}
