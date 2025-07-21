import { useEffect, useState } from "react";
import useNominatim from "../hooks/use-nominatim";
import Map from "../components/map";
import type { LatLng } from "../lib/types";
import FormField from "./form-field";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select } from "antd";
import Card from "./card";
import { IconLabel } from "@tabler/icons-react";

function createNumberOptions(count: number) {
  return Array.from({ length: count }, (_, i) => ({ value: i, label: `${i}` }));
}

const AgeOptions = [
  "ENTRE 10 Y 20 ANOS",
  "MAS DE 20 ANOS",
  "ENTRE 0 Y 5 ANOS",
  "ENTRE 5 Y 10 ANOS",
  "REMODELADO",
  "PARA ESTRENAR",
  "SOBRE PLANOS",
  "EN CONSTRUCCION",
].map((label) => ({
  value: label.replace(/ /g, "_"),
  label: label,
}));

const bathroomOptions = createNumberOptions(5);
const bedRoomOptions = createNumberOptions(5);
const parkingOptions = createNumberOptions(4);
const booleanOptions = [
  { value: "", label: "" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export default function PropertyForm({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const [markerLocation, setMarkerLocation] = useState<LatLng | undefined>(undefined);
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    address: "",
    parkings: "",
    pool: "",
    gym: "",
    admon_price: "",
    elevator: "",
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
  const nextDisabled = stepIndex > 0 && (!formData.age || !formData.area || !formData.bathrooms || !formData.bedrooms);
  const estimateDisabled = nextDisabled || !markerLocation;

  const onMarkerLocationChanged = (location: LatLng) => {
    setMarkerLocation(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct query string from form data
    if (markerLocation) {
      const queryParams = new URLSearchParams({ ...formData, lat: `${markerLocation.lat}`, lng: `${markerLocation.lng}` }).toString();
      // Redirect to estimation page with query params
      navigate(`/estimation?${queryParams}`);
    }
  };

  const title = stepIndex == 0 ? "Bienvenido" : "Detalles del Apartamento";
  const subtitle = stepIndex == 0 ? "Estimación de precios de apartamentos en Bogotá" : "Ingresa los detalles del apartamento a estimar";

  return (
    <Card className={className} title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex flex-col w-full flex-1">
          <div className={`${stepIndex == 0 ? "visible" : "hidden"} w-full flex flex-col h-full py-5 gap-3 text-sm`}>
            <div>
              Este es el sistema de estimación de precios de apartamentos en Bogotá, desarrollado como parte de un trabajo de grado de la
              <b> Maestría en Inteligencia Artificial</b> de la <b>Universidad Sergio Arboleda</b>.
            </div>
            <div>
              En los siguientes pasos, se te solicitará ingresar información básica del apartamento (como el número de habitaciones, área y baños) y
              posteriormente seleccionar su ubicación en el mapa.
            </div>
            <div>
              Con estos datos, el sistema calculará una estimación aproximada del valor del inmueble, basada en modelos desarrollados a partir de
              información del mercado inmobiliario local.
            </div>
            <div className="flex-1"></div>
            <div className="text-xs text-right">Este proceso toma solo unos segundos. Haz clic en Siguiente para comenzar.</div>
          </div>
          <div className={`${stepIndex == 1 ? "visible" : "hidden"} w-full`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField label="Área (m²)" editorId="area">
                <Input addonAfter="m²" id="area" name="area" type="number" placeholder="" value={formData.area} onChange={handleChange} required />
              </FormField>

              <FormField label="Antigüedad" editorId="age">
                <Select className="w-full" value={formData.age} onChange={(value) => handleSelectChange("age", value)} options={AgeOptions} />
              </FormField>

              <FormField label="Habitaciones" editorId="bedrooms">
                <Select
                  className="w-full"
                  value={formData.bedrooms}
                  onChange={(value) => handleSelectChange("bedrooms", value)}
                  options={bedRoomOptions}
                />
              </FormField>

              <FormField label="Baños" editorId="bathrooms">
                <Select
                  className="w-full"
                  value={formData.bathrooms}
                  onChange={(value) => handleSelectChange("bathrooms", value)}
                  options={bathroomOptions}
                />
              </FormField>

              <FormField label="Parqueaderos" editorId="parkings">
                <Select
                  className="w-full"
                  value={formData.parkings}
                  onChange={(value) => handleSelectChange("parkings", value)}
                  options={parkingOptions}
                />
              </FormField>
            </div>
          </div>
          <div className={`${stepIndex == 2 ? "visible" : "hidden"} w-full`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField label="Precio Administración" editorId="admon_price">
                <Input
                  addonBefore="$"
                  id="admon_price"
                  name="admon_price"
                  type="number"
                  placeholder=""
                  value={formData.admon_price}
                  onChange={handleChange}
                  required
                />
              </FormField>
              <FormField label="Tiene Piscina" editorId="pool">
                <Select className="w-full" value={formData.pool} onChange={(value) => handleSelectChange("pool", value)} options={booleanOptions} />
              </FormField>
              <FormField label="Tiene Gimnasio" editorId="gym">
                <Select className="w-full" value={formData.gym} onChange={(value) => handleSelectChange("gym", value)} options={booleanOptions} />
              </FormField>
              <FormField label="Tiene Ascensor" editorId="elevator">
                <Select
                  className="w-full"
                  value={formData.elevator}
                  onChange={(value) => handleSelectChange("elevator", value)}
                  options={booleanOptions}
                />
              </FormField>
            </div>
          </div>
          <div className={`${stepIndex == 3 ? "visible" : "hidden"} flex flex-col h-full`}>
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
                <Button htmlType="button" disabled={!formData.address || locateButtonDisabled} onClick={onLocateInMapClicked}>
                  Ubicar en Mapa
                </Button>
              </div>
            </FormField>
            <FormField label="Ubicación en mapa">
              <Map
                hidden={stepIndex != 3}
                zoom={15}
                width="540px"
                height="200px"
                position={markerLocation}
                positionDraggable={true}
                className="flex-1"
                onMarkerLocationChanged={onMarkerLocationChanged}
              />
            </FormField>
          </div>
        </div>
        <div>
          <div className="w-full flex place-content-between gap-2">
            <div className={`self-end ${stepIndex == 0 ? "" : "hidden"}`}></div>
            <Button htmlType="button" variant="outlined" className={stepIndex > 0 ? "" : "hidden"} onClick={() => setStepIndex(stepIndex - 1)}>
              Volver
            </Button>
            <Button
              htmlType="button"
              type="primary"
              className={`self-end ${stepIndex != 3 ? "" : "hidden"}`}
              disabled={nextDisabled}
              onClick={() => setStepIndex(stepIndex + 1)}
            >
              Siguiente
            </Button>
            <Button htmlType="submit" type="primary" className={stepIndex == 3 ? "" : "hidden"} disabled={estimateDisabled}>
              Obtener Estimación
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
