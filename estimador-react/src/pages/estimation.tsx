import Map from "../components/map";
import { useEffect, useState } from "react";
import type { EstimationResult } from "../lib/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card } from "antd";
import ButtonPanel from "../components/button-panel";


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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);

  useEffect(() => {
    const fetchEstimationResult = async () => {
      const response = await fetch(`/api/estimate?${searchParams.toString()}`);
      const data = await response.json();
      setEstimationResult(data);
    };
    fetchEstimationResult();
  }, [searchParams]);

  if (!estimationResult) {
    return <div></div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <Map zoom={16} position={estimationResult.location} className="h-[500px] w-full" layers={estimationResult.mapLayers} />
          {/*<div className="px-6 text-sm">
              El mapa muestra los sitios cercanos al apartamento, usa el menú de capas para mostrar u ocultar los sitios de interés
              cercanos.
            </div>*/}
          <div className="p-5 flex flex-col gap-3">
            <Card title="Precio estimado">
              <div className="w-full flex flex-row flex-wrap justify-between">
                <PriceCard label="Mínimo" price={estimationResult.estimation.minValue}></PriceCard>
                <PriceCard label="Promedio" size="bold" price={estimationResult.estimation.average}></PriceCard>
                <PriceCard label="Máximo" price={estimationResult.estimation.maxValue}></PriceCard>
              </div>
            </Card>
            <ButtonPanel>
              <Button onClick={() => navigate("/")}>Volver</Button>
            </ButtonPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
