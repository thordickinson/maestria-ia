import Map from "../components/map";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "antd";
import ButtonPanel from "../components/button-panel";
import useEstimation from "../hooks/useEstimation";
import {  useEffect } from "react";
import RegionInfoCard from "../components/region-info.card";
import SitesTable from "../components/sites-table";


const usdFormat = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function PriceCard({label, price, size = "normal"}: {label: string, price: number, size?: string}){
  return <div className="flex flex-col">
    <label className="text-xs">{label}</label>
    <div className={`text-lg font-${size}`}>{usdFormat.format(price)}</div>
  </div>
}

export default function EstimationPage() {
  const navigate = useNavigate();
  const {estimation, loading, error, estimate, response } = useEstimation();

  useEffect(() => {
    console.log(estimation);
  }, [estimation]);

  if(error) {
    return <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-red-500 text-lg">{error}</div>
      <Button onClick={() => navigate("/")}>Volver</Button>
    </div>;
  }



  if (!estimation) {
    return <div></div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <Map zoom={18} position={estimation.location} className="h-[500px] w-full" layers={estimation.mapLayers} />
          {/*<div className="px-6 text-sm">
              El mapa muestra los sitios cercanos al apartamento, usa el menú de capas para mostrar u ocultar los sitios de interés
              cercanos.
            </div>*/}
          <div className="p-5 flex flex-col gap-3">
            <Card title="Precio estimado">
              <div className="w-full flex flex-row flex-wrap justify-between">
                <PriceCard label="Mínimo" price={estimation.estimation.minValue}></PriceCard>
                <PriceCard label="Promedio" size="bold" price={estimation.estimation.average}></PriceCard>
                <PriceCard label="Máximo" price={estimation.estimation.maxValue}></PriceCard>
              </div>
            </Card>
            <RegionInfoCard regionInfo={estimation.regionInfo} />
            {response && <SitesTable response={response} />}
            <ButtonPanel>
              <Button onClick={() => navigate("/")}>Volver</Button>
            </ButtonPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
