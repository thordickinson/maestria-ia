from src.etl.geohash_stats import GeohashStats
from src.estimator.common import EstimationInput, XGBoostEstimator


class ReducedEstimator(XGBoostEstimator):
    """
    Clase base para estimadores que utilizan XGBoost.
    Proporciona métodos comunes para la estimación y la carga del modelo.
    """
    def __init__(self):
        super().__init__("models/final_model.pkl")

    # ['area', 'parqueaderos', 'antiguedad', 'administracion', 'upz', 'banos', 'barrio', 'estado', 'latitud', 'gimnasio', 'longitud']

    # Quitar: Habitaciones, Ascensor
    # Agregar: 
    async def extract_features(self, input: EstimationInput, augmented_data: GeohashStats) -> dict:
        
        antiguedad = input.age.replace("_", " ")
        upz = augmented_data.region_info.get("upz", {}).get("nombre")
        barrio = augmented_data.region_info.get("barrio", {}).get("nombre")
        return {
            'area': input.area,
            'parqueaderos': input.parkings,
            "antiguedad": antiguedad,
            'administracion': input.admon_price,
            'upz': upz,
            'banos': input.bathrooms,
            'barrio': barrio,
            'estado': input.age,
            'gimnasio': input.gym,
            'latitud': input.lat,
            'longitud': input.lng
        }
