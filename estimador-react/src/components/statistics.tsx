import Plot from "react-plotly.js";
import type { EstimationResult } from "../lib/types";
import Card from "./card";
import CardSection from "./card-section";

type EstadisticasPropiedadParams = {
  result: EstimationResult;
};

const EstadisticasPropiedad = ({ result }: EstadisticasPropiedadParams) => {
  const { property_data, region_stats } = result.response;
  const { area, bedrooms, bathrooms } = property_data;

  const regiones = ["barrio", "upz", "localidad"];

  const heatmapMetrics = ["Área", "Habitaciones", "Baños"];
  const heatmapData: number[][] = [];
  const heatmapRegions: string[] = [];

  const standardHeight = 350;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Comparativa de tu propiedad</h2>

      {regiones.map((region) => {
        const stat = region_stats.find((d) => d.tipo_region === region)?.estadisticas_propiedades;

        if (!stat) return null;

        heatmapRegions.push(region);
        heatmapData.push([
          area / stat.area_promedio,
          bedrooms / stat.habitaciones_promedio,
          bathrooms / stat.banos_promedio,
        ]);

        return (
          <div key={region} className="w-full mt-6">
            <CardSection title={region.toUpperCase()} />

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Área */}
              <Card title="Área">
                <Plot
                  data={[
                    {
                      y: [stat.area_q1, stat.area_promedio, stat.area_q3],
                      type: "box",
                      name: "Área (m²)",
                      boxpoints: false,
                      marker: { color: "lightblue" },
                      hoverinfo: "y",
                    },
                    {
                      y: [area],
                      type: "scatter",
                      mode: "markers",
                      marker: { color: "red", size: 12 },
                      name: "Tu propiedad",
                    },
                  ]}
                  layout={{
                    title: { text: `Área en ${region}` },
                    yaxis: { title: { text: "m²" } },
                    showlegend: true,
                    height: standardHeight,
                  }}
                  style={{ width: "100%" }}
                  config={{ responsive: true }}
                />
                <p className="text-sm text-gray-700 mt-2">
                  Tu propiedad tiene un área de <strong>{area} m²</strong>, mientras que en esta región el promedio es{" "}
                  <strong>{stat.area_promedio.toFixed(0)} m²</strong>, con la mayoría de las propiedades entre <strong>{stat.area_q1} m²</strong> y{" "}
                  <strong>{stat.area_q3} m²</strong>.
                </p>
              </Card>

              {/* Habitaciones */}
              <Card title="Habitaciones">
                <Plot
                  data={[
                    {
                      x: ["Promedio", "Tu propiedad"],
                      y: [stat.habitaciones_promedio, bedrooms],
                      type: "bar",
                      marker: { color: ["lightblue", "red"] },
                    },
                  ]}
                  layout={{
                    title: { text: `Habitaciones en ${region}` },
                    yaxis: { title: { text: "Número de habitaciones" } },
                    height: standardHeight,
                  }}
                  style={{ width: "100%" }}
                  config={{ responsive: true }}
                />
                <p className="text-sm text-gray-700 mt-2">
                  Tu propiedad tiene <strong>{bedrooms} habitaciones</strong>, mientras que en esta región el promedio es{" "}
                  <strong>{stat.habitaciones_promedio.toFixed(1)}</strong>.
                </p>
              </Card>

              {/* Baños */}
              <Card title="Baños">
                <Plot
                  data={[
                    {
                      x: ["Promedio", "Tu propiedad"],
                      y: [stat.banos_promedio, bathrooms],
                      type: "bar",
                      marker: { color: ["lightblue", "red"] },
                    },
                  ]}
                  layout={{
                    title: { text: `Baños en ${region}` },
                    yaxis: { title: { text: "Número de baños" } },
                    height: standardHeight,
                  }}
                  style={{ width: "100%" }}
                  config={{ responsive: true }}
                />
                <p className="text-sm text-gray-700 mt-2">
                  Tu propiedad tiene <strong>{bathrooms} baños</strong>, mientras que en esta región el promedio es{" "}
                  <strong>{stat.banos_promedio.toFixed(1)}</strong>.
                </p>
              </Card>

              {/* Avalúo Catastral */}
              <Card title="Avalúo Catastral">
                <Plot
                  data={[
                    {
                      y: [stat.avaluo_cat_q1, stat.avaluo_cat_promedio, stat.avaluo_cat_q3],
                      type: "box",
                      name: "Avalúo Catastral",
                      boxpoints: false,
                      marker: { color: "lightgreen" },
                      hoverinfo: "y",
                    },
                  ]}
                  layout={{
                    title: { text: `Avalúo Catastral en ${region}` },
                    yaxis: { title: { text: "Pesos" } },
                    height: standardHeight,
                  }}
                  style={{ width: "100%" }}
                  config={{ responsive: true }}
                />
                <p className="text-sm text-gray-700 mt-2">
                  En esta región, el avalúo catastral promedio es de <strong>${stat.avaluo_cat_promedio.toLocaleString()}</strong>, con la mayoría de
                  las propiedades entre <strong>${stat.avaluo_cat_q1.toLocaleString()}</strong> y{" "}
                  <strong>${stat.avaluo_cat_q3.toLocaleString()}</strong>.
                </p>
              </Card>

              {/* Avalúo Comercial */}
              <Card title="Avalúo Comercial">
                <Plot
                  data={[
                    {
                      y: [stat.avaluo_com_q1, stat.avaluo_com_promedio, stat.avaluo_com_q3],
                      type: "box",
                      name: "Avalúo Comercial",
                      boxpoints: false,
                      marker: { color: "orange" },
                      hoverinfo: "y",
                    },
                  ]}
                  layout={{
                    title: { text: `Avalúo Comercial en ${region}` },
                    yaxis: { title: { text: "Pesos" } },
                    height: standardHeight,
                  }}
                  style={{ width: "100%" }}
                  config={{ responsive: true }}
                />
                <p className="text-sm text-gray-700 mt-2">
                  En esta región, el avalúo comercial promedio es de <strong>${stat.avaluo_com_promedio.toLocaleString()}</strong>, con la mayoría de
                  las propiedades entre <strong>${stat.avaluo_com_q1.toLocaleString()}</strong> y{" "}
                  <strong>${stat.avaluo_com_q3.toLocaleString()}</strong>.
                </p>
              </Card>
            </div>
          </div>
        );
      })}

      {/* Heatmap */}
      <Card title="Resumen comparativo">
        <Plot
          data={[
            {
              z: heatmapData,
              x: heatmapMetrics,
              y: heatmapRegions,
              type: "heatmap",
              colorscale: "YlGnBu",
              hoverongaps: false,
            },
          ]}
          layout={{
            title: {
              text: "Relación de tu propiedad con el promedio por región",
            },
            xaxis: { title: "Métrica" },
            yaxis: { title: "Región" },
            height: standardHeight,
          }}
          style={{ width: "100%" }}
          config={{ responsive: true }}
        />
        <p className="text-sm text-gray-700 mt-2">
          Este gráfico muestra cómo se compara tu propiedad con el promedio de cada región (barrio, UPZ y localidad) para las diferentes métricas. Los
          valores cercanos a <strong>1</strong> indican que tu propiedad está en línea con el promedio, valores <strong>mayores a 1</strong> indican
          que está por encima, y valores <strong>menores a 1</strong> que está por debajo del promedio. Esto te ayuda a visualizar en qué aspectos tu
          propiedad destaca o se encuentra por debajo de lo típico en cada región.
        </p>
      </Card>
    </div>
  );
};

export default EstadisticasPropiedad;
