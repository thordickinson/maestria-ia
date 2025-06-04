import { getGeohashStats } from './app/services/geohash.service'

async function testCalculation(){
    const lat = 4.6733627;
    const lng = -74.0527488;
    const stats = await getGeohashStats(lat, lng);
    if (stats) {
        console.log("Precalculation successful:", stats);
    } else {
        console.error("Precalculation failed: No stats found for the given coordinates.");
    }
}

testCalculation().then(() => { 
    console.log("Precalculation test completed.")
    process.exit(0);
}).catch(err => { 
    console.error("Error in precalculation test:", err)
    process.exit(1);
});
