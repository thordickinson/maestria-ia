from pydantic import BaseModel

class Place(BaseModel):
    id: str
    name: str
    type: str
    lat: float
    lng: float
