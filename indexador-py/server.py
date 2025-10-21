from fastapi import FastAPI, Query
from typing import Annotated
import uvicorn
from pydantic import BaseModel
from src.estimator.estimator import estimate, EstimationInput, EstimationResult
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import FileResponse
import os
import mimetypes

load_dotenv()

from src.etl.geohash_stats import get_point_stats, get_region_stats

class EstimationRequest(EstimationInput):
    address: str
    model_version: str = "2.1"
    

class EstimationResponse(BaseModel):
    estimation: dict

app = FastAPI()


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


def _get_mime_type(path: str) -> str:
    if path.endswith(".js"):
        return "application/javascript"
    elif path.endswith(".css"):
        return "text/css"
    elif path.endswith(".png") or path.endswith(".jpg") or path.endswith(".webp"):
        return "image/png"
    elif path.endswith(".svg"):
        return "image/svg+xml"
    elif path.endswith(".woff"):
        return "application/font-woff"
    elif path.endswith(".woff2"):
        return "application/font-woff2"
    elif path.endswith(".ttf"):
        return "application/font-ttf"
    elif path.endswith(".eot"):
        return "application/vnd.ms-fontobject"
    elif path.endswith(".ico"):
        return "image/x-icon"
    else:
        return "text/html"

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the React SPA for all non-API routes"""
    file_path = os.path.join("web", full_path)
    
    # If file exists, serve it
    if os.path.isfile(file_path):
        # Guess the mime type based on file extension
        mime_type = _get_mime_type(full_path)
        return FileResponse(file_path, media_type=mime_type)
    
    # Otherwise serve index.html (SPA fallback)
    return FileResponse("web/index.html", media_type="text/html")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
