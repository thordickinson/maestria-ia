from fastapi import FastAPI, Query
from typing import Annotated, Literal
from fastapi.responses import JSONResponse
import uvicorn
from pydantic import BaseModel

from src.etl.geohash_stats import get_point_stats

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
    stats = await get_point_stats(params.lat, params.lng)
    return {
        "estimation": {
            "minValue": 295_000_000,
            "average": 300_000_000,
            "maxValue": 310_000_000
        },
        "stats": stats.model_dump()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
