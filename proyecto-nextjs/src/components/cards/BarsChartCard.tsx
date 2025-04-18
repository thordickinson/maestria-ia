import { Bar, BarChart, CartesianGrid, DefaultLegendContent, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { LabeledValue } from "./PieChartCard";
import SimpleCard, { SimpleCardParams } from "./SimpleCard";

export type BarsChartCard = SimpleCardParams & {
  data: LabeledValue[];
  chartConfig?: ChartConfig;
};

export default function BarsChartCard(params: BarsChartCard) {
  return (
    <SimpleCard {...params}>
      <ChartContainer config={params.chartConfig} className="aspect-auto h-[250px] w-full">
        <BarChart data={params.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <DefaultLegendContent />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ChartContainer>
    </SimpleCard>
  );
}
