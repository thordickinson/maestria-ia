import type { EstimationResponse } from "../lib/types";
import Card from "./card";

const usdFormat = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});


export default function EstimationCard({estimation}: {estimation: EstimationResponse}) {
    return <Card title="Precio estimado">
  <div className="w-full flex flex-col gap-2">

    <div className="flex flex-row justify-between">
      Precio estimado: <b>{estimation.estimation.price}</b>
    </div>

    {estimation.estimation.interval && (
      <div className="text-sm text-gray-600">
        Rango estimado: entre <b>${estimation.estimation.interval[0].toLocaleString()}</b> y <b>${estimation.estimation.interval[1].toLocaleString()}</b>
      </div>
    )}

    {estimation.estimation.r2 && (
      <div className="text-sm text-gray-600">
        Confiabilidad del modelo: <b>{(estimation.estimation.r2 * 100).toFixed(1)}%</b> de varianza explicada
      </div>
    )}

    {estimation.estimation.rmse && (
      <div className="text-sm text-gray-500">
        Error promedio (RMSE): ${Math.round(estimation.estimation.rmse).toLocaleString()}
      </div>
    )}

  </div>
</Card>

}