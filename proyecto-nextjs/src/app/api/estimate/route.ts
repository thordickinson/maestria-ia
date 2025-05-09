import { EstimationResult, MapLayer } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

function buildLayers(): Record<string, MapLayer> {
  return {
    "supermarkets": { label: "Supermercados", markers: 
      {
        "12342": {label: "Exito", location: {lat: 4.6750, lng: -74.056}},
        "12343": {label: "Caruya", location: {lat: 4.6740, lng: -74.053}},
        "12345": {label: "Oxxo", location: {lat: 4.6725, lng: -74.059}}
      }
    },
    "parks": {label: "Párques", markers: 
      {
        "12312": { label: "Parque El virrey", location: {lat: 4.6740507, lng: -74.0560546}}
      }
    },
    "schools": {
      label: "Colegios", markers: {
        "sdfe": {label: "Colegio La Esperanza", location: {lat: 4.672321, lng: -74.063453}}
      }
    }
  }
}



const MockEstimationResult: EstimationResult = {
  estimation :{
    minValue: 340_000_000,
    average: 325_000_000,
    maxValue: 345_000_000
  },
  charts: [],
  location: {
    lat: 4.6733627,
    lng: -74.0527488
  },
  mapLayers: buildLayers(),
}

export async function GET(request: NextRequest) {
  console.log(request.nextUrl.searchParams)
  return NextResponse.json(MockEstimationResult);
}
