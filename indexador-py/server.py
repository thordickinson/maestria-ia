from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI()

@app.get("/estimate")
async def estimate():
    return JSONResponse(content={"message": "Hello, world!"})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
