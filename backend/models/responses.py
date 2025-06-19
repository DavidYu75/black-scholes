from pydantic import BaseModel
from typing import List


class CalculationResponse(BaseModel):
    call_price: float
    put_price: float
    call_delta: float
    put_delta: float
    gamma: float


class HeatmapResponse(BaseModel):
    call_prices: List[List[float]]
    put_prices: List[List[float]]
    spot_values: List[float]
    volatility_values: List[float]
