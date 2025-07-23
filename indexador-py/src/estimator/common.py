from abc import abstractmethod, ABC
from pydantic import BaseModel
import numpy as np
import pandas as pd
import cloudpickle

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

class XGBoostEstimator(AugmentedEstimator):

    def __init__(self, model_path: str, exp_result: bool = True):
        self.model_path = model_path
        self.exp_result = exp_result
        self.__model = None

    def __get_model(self):
        if self.__model is None:
            with open(self.model_path, "rb") as f:
                self.__model = cloudpickle.load(f)
        return self.__model

    @abstractmethod
    async def extract_features(self, input: EstimationInput, augmented_data: GeohashStats) -> dict:
        pass

    async def estimate_with_augmented_data(self, input: EstimationInput, augmented_data: GeohashStats) -> EstimationResult:

        features = await self.extract_features(input, augmented_data)
        for key, value in features.items():
            if isinstance(value, bool):
                features[key] = int(value)
        # Convertir el input a DataFrame
        x_input = pd.DataFrame([features])
        model = self.__get_model()

        # Predecir en log
        y_pred_log = model.predict(x_input)

        # Transformar de vuelta a COP reales
        y_pred_real = np.expm1(y_pred_log) if self.exp_result else y_pred_log
        return EstimationResult(price=float(y_pred_real[0]))
    
    
    

    