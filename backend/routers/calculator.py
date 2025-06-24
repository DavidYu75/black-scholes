from fastapi import APIRouter, HTTPException
from models.requests import CalculationRequest, HeatmapRequest
from models.responses import CalculationResponse, HeatmapResponse
from services.black_scholes import BlackScholesEngine

router = APIRouter()
bs_engine = BlackScholesEngine()


@router.post("/calculate", response_model=CalculationResponse)
async def calculate_option_prices(request: CalculationRequest):
    """Calculate Black-Scholes option prices and Greeks"""
    try:
        result = bs_engine.calculate_option_prices(
            current_price=request.current_price,
            strike_price=request.strike_price,
            time_to_maturity=request.time_to_maturity,
            volatility=request.volatility,
            risk_free_rate=request.risk_free_rate,
            dividend_yield=request.dividend_yield
        )
        return CalculationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/heatmap", response_model=HeatmapResponse)
async def generate_heatmap_data(request: HeatmapRequest):
    """Generate heatmap data for visualization"""
    try:
        result = bs_engine.generate_heatmap_data(
            base_params=request.base_params,
            spot_range=(request.spot_min, request.spot_max),
            volatility_range=(request.vol_min, request.vol_max),
            grid_size=request.grid_size
        )
        return HeatmapResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
