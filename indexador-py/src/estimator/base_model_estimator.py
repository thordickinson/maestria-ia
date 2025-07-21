from src.etl.open_data import get_estrato, get_region_info
from src.estimator.common import Estimator, EstimationResult, EstimationInput
import pandas as pd
import numpy as np
import joblib


class XGBoostEstimator(Estimator):

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.__model = None

    def __get_model(self):
        if self.__model is None:
            self.__model = joblib.load(self.model_path)
        return self.__model

    async def estimate(self, input: EstimationInput) -> EstimationResult:

        lat, lng = input.lat, input.lng
        region_info = await get_region_info(lat, lng)
        estrato = await get_estrato(lat, lng)
        input_dict = input.model_dump()
        input_dict.update({
            "estrato": estrato,
            "sector": region_info.get("barrio", {}).get("nombre", ""),
            "latitud": lat,
            "longitud": lng
        })

        # Convertir el input a DataFrame
        X_input = pd.DataFrame([input.model_dump()])


        model = self.__get_model()

        # Predecir en log
        y_pred_log = model.predict(X_input)

        # Transformar de vuelta a COP reales
        y_pred_real = np.expm1(y_pred_log)
        return EstimationResult(price=float(y_pred_real[0]))
    