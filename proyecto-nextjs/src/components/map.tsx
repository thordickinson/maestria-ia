import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { LatLng } from "@/lib/types"


interface MapProps {
  position: LatLng
  zoom: number
  onMarkerLocationChanged: (position: LatLng) => void
}


export default function Map({position, zoom, onMarkerLocationChanged}: MapProps) {
  const markerRef = useRef<any>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          onMarkerLocationChanged(marker.getLatLng());
        }
      },
    }),
    [],
  )

  return <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }} attributionControl={false} >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker ref={markerRef} position={position} draggable={true} eventHandlers={eventHandlers}>
      <Popup>
        Mueve el marcador para seleccionar la posición de tu inmueble
      </Popup>
    </Marker>
  </MapContainer>
}
