import { EstimationResult, MapLayer } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

function buildLayers(): MapLayer[] {
  return [
    { key:"supermarket", label: "Supermercados", markers: 
      [
        {key: "12342", label: "Exito", location: {lat: 4.6750, lng: -74.056}},
        {key: "12343", label: "Caruya", location: {lat: 4.6740, lng: -74.053}},
        {key: "12345", label: "Oxxo", location: {lat: 4.6725, lng: -74.059}}
      ]
    },{
      key: "park", label: "Parques", markers: 
      [
        {key: "12312", label: "Parque El virrey", location: {lat: 4.6740507, lng: -74.0560546}}
      ]
    }
  ]
}


const MockEstimationResult: EstimationResult = {
  minValue: 340_000_000,
  maxValue: 345_000_000,
  geohash: "d2g6d",
  location: {
    lat: 4.6733627,
    lng: -74.0527488
  },
  mapLayers: buildLayers(),
  stats: []
}

export async function GET(request: NextRequest) {
  console.log(request.nextUrl.searchParams)
  return NextResponse.json(MockEstimationResult);
}
