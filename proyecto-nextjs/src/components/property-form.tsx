"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useNominatim from "@/lib/use-nominatim"
import Map from "./map"
import { LatLng } from "@/lib/types"


export default function PropertyForm() {
  const router = useRouter()
  const [markerLocation, setMarkerLocation] = useState<LatLng| undefined>(undefined);
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    address: "",
  })

  const { results } = useNominatim(formData.address);
  useEffect(() => {
    if(!results || results.length == 0){
      setMarkerLocation(undefined);
    }else {
      const result = results[0]
      setMarkerLocation({lat: result.lat, lng: result.lon});
    }
  }, [results])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onMarkerLocationChanged = (location: LatLng) => {
    setMarkerLocation(location);
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Construct query string from form data
    if(markerLocation){
      const queryParams = new URLSearchParams({...formData, lat: `${markerLocation.lat}`, lng: `${markerLocation.lng}`}).toString()
    // Redirect to estimation page with query params
    router.push(`/estimation?${queryParams}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Property Details</CardTitle>
          <CardDescription>Enter the details of the property you want to list</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  placeholder="1200"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Property Age (years)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="5"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select value={formData.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
                  <SelectTrigger id="bedrooms">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Select value={formData.bathrooms} onValueChange={(value) => handleSelectChange("bathrooms", value)}>
                  <SelectTrigger id="bathrooms">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2.5">2.5</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="3.5">3.5</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter the full property address"
                value={formData.address}
                onChange={handleChange}
                className="min-h-[100px]"
                required
              />
            </div>
            {markerLocation && <Map zoom={15} position={markerLocation} onMarkerLocationChanged={onMarkerLocationChanged} />}
            
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Get Estimation
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

