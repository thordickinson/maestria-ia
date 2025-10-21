from fastapi import FastAPI, Query
from typing import Annotated
import uvicorn
from pydantic import BaseModel
from src.estimator.estimator import estimate, EstimationInput, EstimationResult
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

load_dotenv()

from src.etl.geohash_stats import get_point_stats, get_region_stats

class EstimationRequest(EstimationInput):
    address: str
    model_version: str = "2.1"
    

class EstimationResponse(BaseModel):
    estimation: dict

app = FastAPI()

app.mount("/web", StaticFiles(directory="./web"), name="web")

@app.get("/api/estimate")
async def handle_estimate(params: Annotated[EstimationRequest, Query()]):
    print(f"Received estimation request: {params.model_dump()}")
    stats = await get_point_stats(params.lat, params.lng)
    region_stats = await get_region_stats(params.lat, params.lng)
    result = stats.model_dump()

    estimation = await estimate(params)
   
    result["estimation"] = estimation.model_dump()
    result["region_stats"] = region_stats
    result["property_data"] = params.model_dump()
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
