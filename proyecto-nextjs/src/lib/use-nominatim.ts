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

export default function useNominatim(){
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(undefined)

    useEffect(() => {
        if(!query){
            setResults([]);
            return;
        }
        setLoading(true);
        setError(undefined);
        setResults([])
        const params = new URLSearchParams({format: 'json', q: `${COUNTRY_CITY}, ${query}`}).toString();
        fetch(NOMINATIM_URL + params).then(r => r.json().then(json => setResults(json))).catch(e => setError(e)).finally(() => setLoading(false))
    }, [query]);

    return {results, setQuery, loading, error};
}