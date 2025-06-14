export type Place = {
    id: string
    name: string
    type: string
    lat: number
    lng: number
}

export interface RegionInfo {
    localidad?: {
        codigo: string;
        nombre: string;
    };
    barrio?: {
        codigo: string;
        nombre: string;
    };
    upz?: {
        codigo: string;
        nombre: string;
    };
}


export interface PricePrediction {
    min: number;
    max: number;
}