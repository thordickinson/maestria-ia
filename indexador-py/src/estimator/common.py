from abc import abstractmethod, ABC
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd


# area, antiguedad, lat, lng, piscina, 
# gimnasio, precio_admin, ascensor, 
# habitaciones, banos, parqueaderos

class EstimationInput(BaseModel):
    area: float
    age: str
    bedrooms: int
    bathrooms: int
    parkings: int

    pool: bool
    gym: bool
    admon_price: float
    elevator: bool

    lat: float
    lng: float

class EstimationResult(BaseModel):
    price: float


class Estimator(ABC):
    @abstractmethod
    async def estimate(self, input: EstimationInput) -> EstimationResult:
        pass



