export function parsePoint(point: string): [number, number] {
    // Parse this kind of text to lat, lng POINT(-74.0575685 4.6573304)
    point = point.trim();
    if (!point.startsWith("POINT(") || !point.endsWith(")")) {
        throw new Error(`Invalid point format: ${point}`);
    }
    const coords = point.slice(6, -1).split(" ");
    if (coords.length !== 2) {
        throw new Error(`Invalid point format: ${point}`);
    }
    const lng = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);
    if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`Invalid coordinates: ${point}`);
    }
    return [lat, lng];
}