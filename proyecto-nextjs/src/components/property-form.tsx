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

export default function PropertyForm({className}: {className?: string}) {
  const router = useRouter();
  const [markerLocation, setMarkerLocation] = useState<LatLng | undefined>(undefined);
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    address: "",
  });

  const { results, setQuery } = useNominatim();
  useEffect(() => {
    if (!results || results.length == 0) {
      setMarkerLocation(undefined);
    } else {
      const result = results[0];
      setMarkerLocation({ lat: result.lat, lng: result.lon });
    }
  }, [results]);

  const onLocateInMapClicked = () => {
    setQuery(formData.address)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const locateButtonDisabled = !formData?.address || formData.address.length < 3
  const estimationButtonDisabled = !formData.age || !formData.area || !formData.bathrooms || !formData.bedrooms || !markerLocation

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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 flex md:gap-6 flex-col md:flex-row">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input id="area" name="area" type="number" placeholder="" value={formData.area} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Antigüedad (años)</Label>
                  <Input id="age" name="age" type="number" placeholder="" value={formData.age} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Habitaciones</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Baños</Label>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Ingresa la dirección completa del inmueble"
                  value={formData.address}
                  onChange={handleChange}
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
            <Map zoom={15} position={markerLocation} positionDraggable={true} className="md:w-[300px] md:h-[270px]" onMarkerLocationChanged={onMarkerLocationChanged} />
          </CardContent>
          <CardFooter>
            <div className="w-full flex gap-2 align-stretch">
            <Button type="button" variant="secondary" className="flex-1" disabled={locateButtonDisabled} onClick={onLocateInMapClicked}>
              Ubicar en Mapa
            </Button>
            <Button type="submit" className="flex-1" disabled={estimationButtonDisabled}>
              Obtener Estimación
            </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
  );
}
