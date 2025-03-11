'use client'

import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Map from '@/components/map'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EstimationResult } from '@/lib/types';


const rawData = [
  { year: 2010, count: 10 },
  { year: 2011, count: 20 },
  { year: 2012, count: 15 },
  { year: 2013, count: 25 },
  { year: 2014, count: 22 },
  { year: 2015, count: 30 },
  { year: 2016, count: 28 },
];

const data: any = {
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
      console.log(data);
    };
    fetchEstimationResult();
  }, [searchParams]);

  return (
    <div>
      <Card>
        <CardHeader>Hola Tarjeta</CardHeader>
        <CardContent>Contenido</CardContent>
      </Card>
      <Card>
        <CardContent>
          <Map zoom={15} position={{ lat: 4.71, lng: -74.13 }} />
        </CardContent>
      </Card>
      <Card>
        <Chart type='line' data={data} />
        <Button>Volver</Button>
      </Card>
      {estimationResult && (
        <Card>
          <CardHeader>Estimation Result</CardHeader>
          <CardContent>
            <p>Min Price: {estimationResult.minValue}</p>
            <p>Max Price: {estimationResult.maxValue}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
