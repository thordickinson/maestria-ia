"use client";

import { MapContainer, Marker, TileLayer, Popup, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useEffect, useMemo, useRef } from "react";
import { LatLng, MapLayer } from "@/lib/types";

interface MapProps {
  position: LatLng;
  zoom: number;
  onMarkerLocationChanged?: (position: LatLng) => void;
  layers?: MapLayer[];
}

export default function Map({ position, zoom, layers = [], onMarkerLocationChanged }: MapProps) {
  const markerRef = useRef<any>(null);

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

  return (
    <div>
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }} attributionControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="bottomright">
          {layers.map((layer) => (
            <LayersControl.Overlay key={layer.key} name={layer.label} checked>
              <LayerGroup>
              {layer.markers.map((marker) => (
                <Marker key={marker.key} position={marker.location}>
                  <Popup>{marker.label}</Popup>
                </Marker>
              ))}
              </LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
        <Marker ref={markerRef} position={position} draggable={true} eventHandlers={eventHandlers}>
          <Popup>Mueve el marcador para seleccionar la posición de tu inmueble</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
