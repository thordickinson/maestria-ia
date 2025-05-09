import PieChartCard from "./cards/PieChartCard"
import BarsChartCard from "./cards/BarsChartCard"
import VariationCard from "./cards/VariationCard"
import { LineChart } from "lucide-react"
import LineChartCard from "./cards/LineChartCard"
import VegaChartCard from "./cards/VegaChartCard"

const PieChartData = [
  {
    label: "Group A",
    value: 2400,
  },
  {
    label: "Group B",
    value: 4567,
  },
  {
    label: "Group C",
    value: 1398,
  },
  {
    label: "Group D",
    value: 9800,
  },
  {
    label: "Group E",
    value: 3908,
  },
  {
    label: "Group F",
    value: 4800,
  },
];


export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <PieChartCard data={PieChartData} title="Pie Chart" subtitle="A small chart displaying something" />
      <BarsChartCard data={PieChartData} title="Bars Chart" subtitle="A small chart displaying something"/>
      <LineChartCard data={PieChartData} title="Line Chart" subtitle="A small chart displaying something"/>
      <VariationCard />
    </div>
  )
}
