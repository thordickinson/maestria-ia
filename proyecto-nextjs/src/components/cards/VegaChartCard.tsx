import SimpleCard, { SimpleCardParams } from "./SimpleCard"
import React from 'react';
import { VegaLite } from 'react-vega';

const spec = {
  description: "Ejemplo de gráfico de barras",
  mark: "bar",
  encoding: {
    x: { field: "a", type: "ordinal" },
    y: { field: "b", type: "quantitative" }
  },
  autosize: {
    type: "fit",  // o "pad"
    contains: "padding" // o "content"
  },
  data: {
    values: [
      { a: "A", b: 28 },
      { a: "B", b: 55 },
      { a: "C", b: 43 },
      { a: "D", b: 91 },
      { a: "E", b: 81 },
      { a: "F", b: 53 },
      { a: "G", b: 19 },
      { a: "H", b: 87 },
    ]
  }
} as any;

export type VegaChartCardParams = SimpleCardParams & {
}

export default function VegaChartCard(params: VegaChartCardParams){
    return  <SimpleCard {...params}>
        <VegaLite spec={spec} />
  </SimpleCard>
}