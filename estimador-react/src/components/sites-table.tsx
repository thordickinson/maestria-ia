import { Table } from "antd";
import type { EstimationResponse } from "../hooks/useEstimation";
import { useMemo } from "react";
import type { ColumnType } from "antd/es/table";
import Card from "./card";
import { getSiteTypeLabel } from "../lib/utils";

interface SitestTableParams {
    response: EstimationResponse
}

function parseDistance(distance: string): number{
    // 100m
    return parseInt(distance.slice(distance.length - 1))
}


function buildDataSource(response: EstimationResponse): {columns: ColumnType[], data: Record<string, string|number>[]}{
    const {nearby_places} = response
    const counts: Record<string, Record<string,number|string>> = {}
    const distances = Object.keys(nearby_places)
    const columns = [{
        key: "placeType",
        title: "Tipo de lugar",
        dataIndex: "placeType"
    }, ...distances.map( key => ({key, title: key, dataIndex: key}))]

    const getPlaceCounts = (placeType: string) => {
        const cached = counts[placeType]
        if(cached){
            return cached
        }
        const counter = Object.fromEntries(distances.map(d => [d, 0]))
        counts[placeType] = { placeType: getSiteTypeLabel(placeType), ...counter }
        return counter
    }

    for(const distance of distances){
        Object.entries(nearby_places[distance]).forEach(([placeType, placeList]) => {
            const countsObject = getPlaceCounts(placeType)
            const count = countsObject[distance] as number
            countsObject[distance] = count + placeList.length
        })
    }
    console.log(counts, columns)
    return {columns, data: Object.values(counts)}
}

export default function SitesTable({response}: SitestTableParams) {
    const {data, columns} = useMemo(() => buildDataSource(response), [response])
    return <Card title="Sitios cercanos" subtitle="Esta es la lista de sitios cercanos al apartamento">
        <Table dataSource={data} columns={columns} />
    </Card>
}