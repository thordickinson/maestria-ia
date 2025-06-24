export type LatLng = {
    lat: number
    lng: number
}

export type MapMarker = {
    label: string
    location: LatLng
    icon: string
}

export type MapLayer = {
    label: string
    markers: Record<string,MapMarker>
}

export type Stat = {
    field: string
}

export type EstimationResult = {
    geohash: string
    estimation: {
        minValue: number
        average: number
        maxValue: number
    },
    location: LatLng
    mapLayers: Record<string, MapLayer>
}

export const DEFAULT_POSITION: LatLng = { lat: -74.43, lng: 4.19}
