from fastapi import FastAPI, Query
from typing import Annotated
import uvicorn
from pydantic import BaseModel

from src.etl.geohash_stats import get_point_stats, get_region_stats

class EstimationRequest(BaseModel):
    lat: float
    lng: float
    area: float
    bedrooms: int
    bathrooms: int
    age: int
    

class EstimationResponse(BaseModel):
    estimation: dict

app = FastAPI()

@app.get("/api/estimate")
async def estimate(params: Annotated[EstimationRequest, Query()]):
    print(f"Received estimation request: {params.model_dump()}")
    stats = await get_point_stats(params.lat, params.lng)
    region_stats = await get_region_stats(params.lat, params.lng)
    result = stats.model_dump()
    result["estimation"] = {
        "minValue": 295_000_000,
        "average": 300_000_000,
        "maxValue": 310_000_000
    }
    result["region_stats"] = region_stats
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
