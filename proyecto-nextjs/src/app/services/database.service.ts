import postgres from 'postgres';

export const sql = postgres({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});


export async function doQuery(query: postgres.PendingQuery<postgres.Row[]>): Promise<any> {
    try {
        const result = await query;
        return result;
    } catch (error) {
        console.error('Error fetching query:', error);
        throw new Error('Failed to fetch query data');
    }
}

export async function doUpdate(query: postgres.PendingQuery<postgres.Row[]>): Promise<number> {
    try {
        const result = await query;
        if (result.count === undefined) {
            throw new Error('Update query did not return a count');
        }
        return result.count;
    }
    catch (error) {
        console.error('Error executing update query:', error);
        throw new Error('Failed to execute update query');
    }
}

export async function doQueryOne(query: postgres.PendingQuery<postgres.Row[]>): Promise<any|undefined> {
    const result = await doQuery(query);
    if (result.length === 0) {
        return undefined;
    }
    return result[0];
}
