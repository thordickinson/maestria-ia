"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useNominatim from "@/lib/use-nominatim";
import Map from "./map";
import { LatLng } from "@/lib/types";
import FormField from "./ui/form-field";

export default function PropertyForm({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();
  const [markerLocation, setMarkerLocation] = useState<LatLng | undefined>(undefined);
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    address: "",
  });

  const { results, setQuery, loading: loadingLocation } = useNominatim();
  useEffect(() => {
    if (!results || results.length == 0) {
      setMarkerLocation(undefined);
    } else {
      const result = results[0];
      setMarkerLocation({ lat: result.lat, lng: result.lon });
    }
  }, [results]);

  const onLocateInMapClicked = () => {
    setQuery(formData.address);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const locateButtonDisabled = !formData?.address || formData.address.length < 3;
  const nextDisabled = !formData.age || !formData.area || !formData.bathrooms || !formData.bedrooms;
  const estimateDisabled = nextDisabled || !markerLocation

  const onMarkerLocationChanged = (location: LatLng) => {
    setMarkerLocation(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct query string from form data
    if (markerLocation) {
      const queryParams = new URLSearchParams({ ...formData, lat: `${markerLocation.lat}`, lng: `${markerLocation.lng}` }).toString();
      // Redirect to estimation page with query params
      router.push(`/estimation?${queryParams}`);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Detalles del Apartamento</CardTitle>
        <CardDescription>Ingresa los detalles del apartamento a estimar</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <CardContent className="flex flex-col w-full flex-1">
          <div className={`${stepIndex == 0 ? "visible" : "hidden"} w-full`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Área (m²)" editorId="area">
                <Input id="area" name="area" type="number" placeholder="" value={formData.area} onChange={handleChange} required />
              </FormField>

              <FormField label="Antigüedad (años)" editorId="age">
                <Input id="age" name="age" type="number" placeholder="" value={formData.age} onChange={handleChange} required />
              </FormField>

              <FormField label="Habitaciones" editorId="bedrooms">
                <Select value={formData.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
                  <SelectTrigger id="bedrooms">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6+">6+</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Baños" editorId="bathrooms">
                <Select value={formData.bathrooms} onValueChange={(value) => handleSelectChange("bathrooms", value)}>
                  <SelectTrigger id="bathrooms">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
          <div className={`${stepIndex == 1 ? "visible" : "hidden"} flex flex-col h-full`}>
            <FormField label="Dirección" editorId="address">
              <div className="flex flex-row gap-2">
                <Input
                  id="address"
                  name="address"
                  placeholder="Ingresa la dirección completa del inmueble"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <Button type="button" disabled={!formData.address || locateButtonDisabled} onClick={onLocateInMapClicked}>Ubicar en Mapa</Button>
              </div>
            </FormField>
            <FormField label="Ubicación en mapa">
            <Map
              zoom={15}
              position={markerLocation}
              positionDraggable={true}
              className="flex-1 h-[200px] w-[520px]"
              onMarkerLocationChanged={onMarkerLocationChanged}
            />
            </FormField>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex place-content-between gap-2">
            <div className={`self-end ${stepIndex == 0 ? "" : "hidden"}`}></div>
            <Button type="button" className={`self-end ${stepIndex == 0 ? "" : "hidden"}`} disabled={nextDisabled} onClick={() => setStepIndex(stepIndex + 1)}>
              Siguiente
            </Button>
            <Button type="button" variant="outline" className={stepIndex == 1 ? "" : "hidden"} onClick={() => setStepIndex(stepIndex - 1)}>
              Volver
            </Button>
            <Button type="submit" className={stepIndex == 1 ? "" : "hidden"} disabled={estimateDisabled}>
              Obtener Estimación
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
