import { PlaceQuery } from "./stats"

export type Point = {
  lat: number
  lng: number
}

export type Place = {
    id: string
    name: string
    location: Point
}

export type TaskConfiguration = {
  geohashLevel: number
  geohashes: string[]
  radius: number[]
}

export type TaskContext = {
  configuration: TaskConfiguration
  queries: PlaceQuery[]
}

export type Ubicacion = {
  barrio: string
  localidad: string
}

export type NearbyPlaces = {
  distance: number
  places: Record<string, Place[]>
}

export type NearbyPlaceCounters = {
  distance: number
  places: Record<string, number>
}

export type GeohashInfo = {
  geohash: string
  center: Point
  barrio?: string
  localidad?: string
  places: NearbyPlaces[]
  counters: NearbyPlaceCounters[]
}

