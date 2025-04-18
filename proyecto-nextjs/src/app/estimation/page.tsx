'use client'

import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Map from '@/components/map'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EstimationResult } from '@/lib/types';
import { IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';

import data from "../dashboard/data.json"


const rawData = [
  { year: 2010, count: 10 },
  { year: 2011, count: 20 },
  { year: 2012, count: 15 },
  { year: 2013, count: 25 },
  { year: 2014, count: 22 },
  { year: 2015, count: 30 },
  { year: 2016, count: 28 },
];

const data1: any = {
  labels: rawData.map(row => row.year),
  datasets: [
    {
      label: 'Acquisitions by year',
      data: rawData.map(row => row.count)
    }
  ]
}

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
  
  if(!estimationResult){
    return <div></div>
  }

  return (

    <div className="flex flex-1 flex-col">
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
          <Map zoom={16} position={estimationResult.location} layers={estimationResult.mapLayers} />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  </div>

   
  );
}
