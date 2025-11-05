import type { EstimationResponse } from "../lib/types";
import Plot from "react-plotly.js";
import Card from "./card";
import { Tooltip } from "antd";

const usdFormat = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function EstimationCard({ estimation }: { estimation: EstimationResponse }) {
  const { price, interval, r2, rmse } = estimation.estimation;
  const gaugeValue = r2 ? Math.round(r2 * 100) : 0;

  return (
    <Card title="Precio estimado" subtitle="Este es el precio estimado de tu apartamento">
      <div className="w-full flex flex-col gap-6">
        {!interval && <div className="text-xl font-bold text-red-500 text-center">{usdFormat.format(price)}</div>}
        {/* Intervalo de confianza */}
        {interval && (
          <Tooltip
            title="Este es el rango en el cual se estima que puede encontrarse el precio real del inmueble, con base en el comportamiento histórico del modelo."
            placement="top"
          >
            <div className="grid grid-cols-3 text-center text-sm text-gray-700 cursor-help">
              <div>
                <div className="text-xs text-gray-500">Mínimo</div>
                <div className="font-semibold">{usdFormat.format(interval[0])}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Estimado</div>
                <div className="text-xl font-bold text-blue-600">{usdFormat.format(price)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Máximo</div>
                <div className="font-semibold">{usdFormat.format(interval[1])}</div>
              </div>
            </div>
          </Tooltip>
        )}

        {/* Gauge de confiabilidad */}
        {r2 && (
          <Tooltip
            title="Indica qué tan bien el modelo predice los precios con base en los datos históricos. Un valor de 100% significa una predicción perfecta."
            placement="top"
          >
            <div className="w-full flex justify-center cursor-help">
              <Plot
                data={[
                  {
                    type: "indicator",
                    mode: "gauge+number",
                    value: gaugeValue,
                    title: { text: "Confiabilidad del modelo", font: { size: 14 } },
                    gauge: {
                      axis: { range: [0, 100], tickwidth: 1, tickcolor: "gray" },
                      bar: { color: "#484848af" },
                      steps: [
                        { range: [0, 60], color: "#f5a4a4ff" },
                        { range: [60, 80], color: "#f9e8a1ff" },
                        { range: [80, 100], color: "#a1f7c1ff" },
                      ],
                    },
                  },
                ]}
                layout={{
                  width: 220,
                  height: 180,
                  margin: { t: 20, b: 0, l: 0, r: 0 },
                }}
                config={{ displayModeBar: false }}
              />
            </div>
          </Tooltip>
        )}

        {/* RMSE */}
        {rmse && (
          <Tooltip
            title="El RMSE indica el error promedio entre los precios reales y los estimados durante el entrenamiento. Un menor valor indica mayor precisión."
            placement="top"
          >
            <div className="text-xs text-center text-gray-500 cursor-help">
              Error promedio histórico (RMSE): <span className="font-medium">{usdFormat.format(Math.round(rmse))}</span>
            </div>
          </Tooltip>
        )}
      </div>
    </Card>
  );
}
