import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { LabeledValue } from "./PieChartCard";
import SimpleCard, { SimpleCardParams } from "./SimpleCard";

export type PieChartCardParams = SimpleCardParams & {
  data: LabeledValue[];
  chartConfig?: ChartConfig;
};

export default function LineChartCard(params: PieChartCardParams) {
  return (
    <SimpleCard {...params}>
      <ChartContainer config={params.chartConfig} className="aspect-auto h-[250px] w-full">
        <LineChart width={730} height={250} data={params.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ChartContainer>
    </SimpleCard>
  );
}
