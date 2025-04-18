import { ChartConfig, ChartContainer } from "../ui/chart";
import SimpleCard, { SimpleCardParams } from "./SimpleCard";
import { Area, PieChart, CartesianGrid, XAxis, Pie } from "recharts";

export type LabeledValue = {
    label: string
    value: number
}

export type PieChartCardParams = SimpleCardParams & {
    data: LabeledValue[]
    chartConfig?: ChartConfig
}


export default function PieChartCard(params: PieChartCardParams) {
  return (
    <SimpleCard {...params}>
      <ChartContainer config={params.chartConfig} className="aspect-auto h-[250px] w-full">
        <PieChart width={50} height={50}>
          <Pie data={params.data} dataKey="value" nameKey="label" cx="50%" cy="50%" fill="#82ca9d" label />
        </PieChart>
      </ChartContainer>
    </SimpleCard>
  );
}
