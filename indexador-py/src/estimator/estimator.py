from src.estimator.common import EstimationResult, Estimator, EstimationInput, MockEstimator
from src.estimator.base_model_estimator import XGBoostEstimator

__implementation_type = "mock"
__estimator_impl: Estimator | None = None


def __get_estimator() -> Estimator:
    global __estimator_impl
    global __implementation_type
    if __estimator_impl is not None:
        return __estimator_impl
    if __implementation_type == "mock":
        __estimator_impl = MockEstimator(400_000_000)
    elif __implementation_type == "baseline":
        __estimator_impl = XGBoostEstimator("data/xgboost_model_1.pkl")
    if __estimator_impl is None:
        raise ValueError(f"Unknown estimator implementation type: {__implementation_type}")
    return __estimator_impl

async def estimate(params: EstimationInput) -> EstimationResult:
    estimator = __get_estimator()
    estimation = await estimator.estimate(params)
    return estimation
