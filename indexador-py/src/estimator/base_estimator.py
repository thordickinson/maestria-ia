from src.etl.geohash_stats import GeohashStats
from src.estimator.common import EstimationInput, XGBoostEstimator


class EstimatorV1(XGBoostEstimator):
    """
    Clase base para estimadores que utilizan XGBoost.
    Proporciona métodos comunes para la estimación y la carga del modelo.
    """
    
    barrios_top = [
        'VILLAS DE ARANJUEZ', 'SAN', 'SAN PATRICIO', 'CHICO RESERVADO'
    ]
    def __init__(self):
        super().__init__("models/prediction_model.pkl")

    async def extract_features(self, input: EstimationInput, augmented_data: GeohashStats) -> dict:
        
        barrio_top = augmented_data.region_info.get("barrio", {}).get("nombre", "").upper()
        if barrio_top not in self.barrios_top:
            barrio_top = "OTROS"
        antiguedad = input.age.replace("_", " ")
        
        return {
            'area': input.area,
            'parqueaderos': input.parkings,
            'administracion': input.admon_price,
            'banos': input.bathrooms,
            'habitaciones': input.bedrooms,
            'estado': input.age,
            'gimnasio': input.gym,
            'ascensor' : input.elevator,
            'piscina': input.pool,
            'zona_de_bbq': input.lat,
            'latitud': input.lat,
            'longitud': input.lng,
            "barrio_top": barrio_top,
            "antiguedad": antiguedad
        }