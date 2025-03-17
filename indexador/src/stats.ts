import { promises as fs } from 'fs';
import * as path from 'path';


export type PlaceQuery = {
    name: string
    query: string
}

export async function loadPlaceQueries(): Promise<PlaceQuery[]> {
    const statsDir = 'places';
    const files = await fs.readdir(statsDir);
    const statDefinitions: PlaceQuery[] = [];

    for (const file of files) {
        if (path.extname(file) === '.sql') {
            const filePath = path.join(statsDir, file);
            const query = await fs.readFile(filePath, 'utf-8');
            const name = path.basename(file, '.sql');
            statDefinitions.push({ name, query });
        }
    }
    return statDefinitions;
}