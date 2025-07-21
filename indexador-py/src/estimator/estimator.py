from src.estimator.common import EstimationResult, Estimator, EstimationInput
from src.estimator.base_model_estimator import XGBoostEstimator

__estimator_impl: Estimator | None = None


def __get_estimator() -> Estimator:
    global __estimator_impl
    if __estimator_impl is None:
        __estimator_impl = XGBoostEstimator("data/xgboost_model_1.pkl")
    return __estimator_impl

def estimate(params: EstimationInput) -> EstimationResult:
    estimator = __get_estimator()
    return EstimationResult(price=1000)
