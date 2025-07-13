import Plot from "react-plotly.js";
import type { EstimationResult } from "../lib/types";

type EstadisticasPropiedadParams = {
  result: EstimationResult;
};

const EstadisticasPropiedad = ({ result }: EstadisticasPropiedadParams) => {
  const { property_data, region_stats } = result.response;
  const { area, bedrooms, bathrooms } = property_data;

  const regiones = ["barrio", "upz", "localidad"];

  const heatmapMetrics = [
    "Área",
    "Habitaciones",
    "Baños",
    "Avalúo Catastral",
    "Avalúo Comercial",
  ];
  const heatmapData: number[][] = [];
  const heatmapRegions: string[] = [];

  return (
    <div>
      <h2>Comparativa de tu propiedad</h2>

      {regiones.map((region) => {
        const stat = region_stats.find(
          (d) => d.tipo_region === region
        )?.estadisticas_propiedades;

        if (!stat) return null;

        // Para heatmap
        heatmapRegions.push(region);
        heatmapData.push([
          area / stat.area_promedio,
          bedrooms / stat.habitaciones_promedio,
          bathrooms / stat.banos_promedio,
          stat.avaluo_cat_promedio > 0 ? 1 : 0,
          stat.avaluo_com_promedio > 0 ? 1 : 0,
        ]);

        return (
          <div key={region} style={{ marginBottom: "50px" }}>
            <h3>{region.toUpperCase()}</h3>

            {/* Área Boxplot */}
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
                height: 400,
              }}
            />

            {/* Habitaciones Barras */}
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
                height: 300,
              }}
            />

            {/* Baños Barras */}
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
                height: 300,
              }}
            />

            {/* Avalúo catastral */}
            <Plot
              data={[
                {
                  y: [
                    stat.avaluo_cat_q1,
                    stat.avaluo_cat_promedio,
                    stat.avaluo_cat_q3,
                  ],
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
                height: 400,
              }}
            />

            {/* Avalúo comercial */}
            <Plot
              data={[
                {
                  y: [
                    stat.avaluo_com_q1,
                    stat.avaluo_com_promedio,
                    stat.avaluo_com_q3,
                  ],
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
                height: 400,
              }}
            />
          </div>
        );
      })}

      {/* Heatmap resumen */}
      <h3>Resumen Comparativo</h3>
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
          height: 400,
        }}
      />
    </div>
  );
};

export default EstadisticasPropiedad;
