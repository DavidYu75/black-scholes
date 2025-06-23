from pydantic import BaseModel, Field
from typing import Optional


class CalculationRequest(BaseModel):
    current_price: float = Field(..., gt=0, description="Current asset price")
    strike_price: float = Field(..., gt=0, description="Option strike price")
    time_to_maturity: float = Field(..., gt=0, description="Time to maturity in years")
    volatility: float = Field(..., gt=0, le=5, description="Volatility (annual)")
    risk_free_rate: float = Field(..., ge=0, le=1, description="Risk-free interest rate")
    dividend_yield: float = Field(0.0, ge=0, le=1, description="Annual dividend yield (as decimal, e.g., 0.02 for 2%)")


class HeatmapRequest(BaseModel):
    base_params: CalculationRequest
    spot_min: float = Field(..., gt=0)
    spot_max: float = Field(..., gt=0)
    vol_min: float = Field(..., gt=0, le=5)
    vol_max: float = Field(..., gt=0, le=5)
    grid_size: Optional[int] = Field(10, ge=5, le=20, description="Grid size for heatmap")
    