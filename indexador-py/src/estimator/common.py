from abc import abstractmethod, ABC
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

from src.etl.geohash_stats import get_point_stats, GeohashStats


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

class AugmentedEstimator(Estimator):
    
    async def estimate(self, input: EstimationInput) -> EstimationResult:
        stats = await get_point_stats(input.lat, input.lng)
        estimation = await self.estimate_with_augmented_data(input, stats)
        return estimation

    @abstractmethod
    async def estimate_with_augmented_data(self, input: EstimationInput, augmented_data: GeohashStats) -> EstimationResult:
        pass


class MockEstimator(AugmentedEstimator):
    def __init__(self, price: float = 1000.0):
        self.price = price

    async def estimate_with_augmented_data(self, input: EstimationInput, augmented_data: GeohashStats) -> EstimationResult:
        print(f"Mock estimation for {input.model_dump()}")
        return EstimationResult(price=self.price)
