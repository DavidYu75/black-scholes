import numpy as np
from scipy.stats import norm
from typing import Dict, List, Tuple


class BlackScholesEngine:
    """Black-Scholes options pricing engine"""
    
    def __init__(self):
        pass
    
    def calculate_option_prices(
        self,
        current_price: float,
        strike_price: float,
        time_to_maturity: float,
        volatility: float,
        risk_free_rate: float,
        dividend_yield: float = 0.0
    ) -> Dict[str, float]:
        """
        Calculate Black-Scholes option prices and Greeks with dividend yield
        
        Args:
            current_price: Current price of the underlying asset
            strike_price: Strike price of the option
            time_to_maturity: Time to expiration in years
            volatility: Annualized volatility (as decimal, e.g., 0.20 for 20%)
            risk_free_rate: Annual risk-free rate (as decimal, e.g., 0.05 for 5%)
            dividend_yield: Annual dividend yield (as decimal, e.g., 0.02 for 2%)
        
        Returns:
            dict: Contains call_price, put_price, call_delta, put_delta, gamma
        """
        # Input validation
        if any(x <= 0 for x in [current_price, strike_price, time_to_maturity, volatility]):
            raise ValueError("current_price, strike_price, time_to_maturity, and volatility must be positive")
        if any(not 0 <= x <= 1 for x in [risk_free_rate, dividend_yield]):
            raise ValueError("risk_free_rate and dividend_yield must be between 0 and 1")
        
        # Calculate d1 and d2 with dividend yield
        d1 = (np.log(current_price / strike_price) + 
             (risk_free_rate - dividend_yield + 0.5 * volatility ** 2) * time_to_maturity) / \
            (volatility * np.sqrt(time_to_maturity))
        
        d2 = d1 - volatility * np.sqrt(time_to_maturity)
        
        # Calculate cumulative distribution function values
        N_d1 = norm.cdf(d1)
        N_d2 = norm.cdf(d2)
        N_neg_d1 = norm.cdf(-d1)
        N_neg_d2 = norm.cdf(-d2)
        
        # Calculate discount factors
        discount_factor = np.exp(-risk_free_rate * time_to_maturity)
        dividend_discount = np.exp(-dividend_yield * time_to_maturity)
        
        # Calculate call and put prices with dividend yield
        call_price = (current_price * dividend_discount * N_d1 - 
                     strike_price * discount_factor * N_d2)
        put_price = (strike_price * discount_factor * N_neg_d2 - 
                    current_price * dividend_discount * N_neg_d1)
        
        # Calculate Greeks with dividend yield
        call_delta = dividend_discount * N_d1
        put_delta = -dividend_discount * N_neg_d1
        gamma = norm.pdf(d1) / (current_price * volatility * np.sqrt(time_to_maturity))
        
        # Round all results to 6 decimal places using banker's rounding
        return {
            "call_price": round(call_price, 2),
            "put_price": round(put_price, 2),
            "call_delta": round(call_delta, 4),
            "put_delta": round(put_delta, 4),
            "gamma": round(gamma, 4)
        }
    
    def generate_heatmap_data(
        self,
        base_params,
        spot_range: Tuple[float, float],
        volatility_range: Tuple[float, float],
        grid_size: int = 10
    ) -> Dict[str, List]:
        """
        Generate heatmap data for visualization
        
        Args:
            base_params: CalculationRequest object containing base parameters for the option
            spot_range: Tuple of (min_spot, max_spot) for the x-axis
            volatility_range: Tuple of (min_vol, max_vol) for the y-axis
            grid_size: Number of points in each dimension (default=10)
            
        Returns:
            dict: Contains call_prices, put_prices, spot_values, volatility_values
        """
        # Extract base parameters from the request model
        strike_price = base_params.strike_price
        time_to_maturity = base_params.time_to_maturity
        risk_free_rate = base_params.risk_free_rate
        dividend_yield = base_params.dividend_yield
        
        # Ensure spot and volatility ranges are valid
        spot_min, spot_max = sorted(spot_range)
        vol_min, vol_max = sorted(volatility_range)
        
        # If min equals max, create a small range around the value for better visualization
        if spot_min == spot_max:
            spot_min = max(0.1, spot_min * 0.9)
            spot_max = spot_max * 1.1
            
        if vol_min == vol_max:
            vol_min = max(0.01, vol_min * 0.5)
            vol_max = min(2.0, vol_max * 1.5)  # Cap max volatility at 200%
        
        # Create linear spaces for spot prices and volatilities
        spot_values = np.linspace(spot_min, spot_max, grid_size)
        volatility_values = np.linspace(vol_min, vol_max, grid_size)
        
        # Initialize empty matrices for call and put prices
        call_prices = np.zeros((grid_size, grid_size))
        put_prices = np.zeros((grid_size, grid_size))
        
        # Calculate option prices for each combination of spot and volatility
        for i, spot in enumerate(spot_values):
            for j, vol in enumerate(volatility_values):
                try:
                    # Skip if spot price is zero to avoid division by zero
                    if spot <= 0 or vol <= 0:
                        call_prices[i, j] = 0
                        put_prices[i, j] = max(0, strike_price * np.exp(-risk_free_rate * time_to_maturity) - spot)
                        continue
                        
                    # Calculate option prices
                    result = self.calculate_option_prices(
                        current_price=spot,
                        strike_price=strike_price,
                        time_to_maturity=time_to_maturity,
                        volatility=vol,
                        risk_free_rate=risk_free_rate,
                        dividend_yield=dividend_yield
                    )
                    call_prices[i, j] = result['call_price']
                    put_prices[i, j] = result['put_price']
                    
                except (ValueError, ZeroDivisionError) as e:
                    # Fallback to intrinsic value for calls and puts
                    call_prices[i, j] = max(0, spot - strike_price)
                    put_prices[i, j] = max(0, strike_price - spot)
        
        # Convert numpy arrays to lists for JSON serialization and round to 2 decimal places
        return {
            'call_prices': call_prices.tolist(),
            'put_prices': put_prices.tolist(),
            'spot_values': [round(float(x), 2) for x in spot_values],
            'volatility_values': [round(float(x), 2) for x in volatility_values]
        }
