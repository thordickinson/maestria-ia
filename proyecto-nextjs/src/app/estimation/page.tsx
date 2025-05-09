"use client";

import "chart.js/auto";
import Map from "@/components/map";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EstimationResult } from "@/lib/types";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";

import data from "../dashboard/data.json";
import SimpleCard from "@/components/cards/SimpleCard";

const rawData = [
  { year: 2010, count: 10 },
  { year: 2011, count: 20 },
  { year: 2012, count: 15 },
  { year: 2013, count: 25 },
  { year: 2014, count: 22 },
  { year: 2015, count: 30 },
  { year: 2016, count: 28 },
];

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

const data1: any = {
  labels: rawData.map((row) => row.year),
  datasets: [
    {
      label: "Acquisitions by year",
      data: rawData.map((row) => row.count),
    },
  ],
};

export default function EstimationPage() {
  const searchParams = useSearchParams();
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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Map zoom={16} position={estimationResult.location} layers={estimationResult.mapLayers} />
          </div>
          <div className="p-5 flex flex-col gap-3">
            <SimpleCard title="Precio estimado" subtitle="El precio estimado de tu inmueble es">
              <div className="w-full flex flex-row flex-wrap justify-between">
                <PriceCard label="Mínimo" price={estimationResult.estimation.minValue}></PriceCard>
                <PriceCard label="Promedio" size="bold" price={estimationResult.estimation.average}></PriceCard>
                <PriceCard label="Máximo" price={estimationResult.estimation.maxValue}></PriceCard>
              </div>
            </SimpleCard>
            <ChartAreaInteractive />
            <SectionCards />
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
