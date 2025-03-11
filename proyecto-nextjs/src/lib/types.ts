export type LatLng = {
    lat: number
    lng: number
}

export type MapMarker = {
    key: string
    label: string
    location: LatLng
}

export type MapLayer = {
    key: string
    label: string
    markers: MapMarker[]
}

export type Stat = {

}

export type EstimationResult = {
    geohash: string
    minValue: number
    maxValue: number
    location: LatLng
    mapLayers: MapLayer[]
    stats: Stat[]
}

export const DEFAULT_POSITION: LatLng = { lat: -74.43, lng: 4.19}
