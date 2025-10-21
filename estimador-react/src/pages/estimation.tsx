import Map from "../components/map";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import ButtonPanel from "../components/button-panel";
import useEstimation from "../hooks/useEstimation";
import {  useEffect } from "react";
import RegionInfoCard from "../components/region-info.card";
import SitesTable from "../components/sites-table";
import EstadisticasPropiedad from "../components/statistics";
import EstimationCard from "../components/estimation.card";




export default function EstimationPage() {
  const navigate = useNavigate();
  const {estimation, error, response } = useEstimation();

  useEffect(() => {
    console.log(estimation);
  }, [estimation]);

  if(error) {
    return <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-red-500 text-lg">{error}</div>
      <Button onClick={() => navigate("/")}>Volver</Button>
    </div>;
  }



  if (!estimation || !response) {
    return <div></div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <Map zoom={18} position={estimation.location} width="100%" height="400px" className="h-[500px] w-full" layers={estimation.mapLayers} />
          {/*<div className="px-6 text-sm">
              El mapa muestra los sitios cercanos al apartamento, usa el menú de capas para mostrar u ocultar los sitios de interés
              cercanos.
            </div>*/}
          <div className="p-5 flex flex-col gap-3">
            <EstimationCard estimation={estimation.response}/>
            <RegionInfoCard regionInfo={estimation.regionInfo} estrato={response.valuation["estrato"]}/>
            {response && <SitesTable response={response} />}
            <EstadisticasPropiedad result={estimation}/>
            <ButtonPanel>
              <Button onClick={() => navigate("/")}>Volver</Button>
            </ButtonPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
