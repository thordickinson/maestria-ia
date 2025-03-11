import { useEffect, useMemo, useState } from "react"

type NominatimResult = {
    lat: number
    lon: number
    osm_type: string
    display_name: string
    boundingbox: number[]
    name: string
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?"
const COUNTRY_CITY = "Colombia, Bogotá"

export default function useNominatim(query?: string){
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    useEffect(() => {
        if(!debouncedQuery){
            setResults([]);
            return;
        }
        const params = new URLSearchParams({format: 'json', q: `${COUNTRY_CITY}, ${debouncedQuery}`}).toString();
        fetch(NOMINATIM_URL + params).then(r => r.json().then(json => setResults(json)))
    }, [debouncedQuery]);

    return {results};
}