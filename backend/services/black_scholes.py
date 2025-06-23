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
        base_params: Dict[str, float],
        spot_range: Tuple[float, float],
        volatility_range: Tuple[float, float],
        grid_size: int = 10
    ) -> Dict[str, List]:
        """
        Generate heatmap data for visualization
        
        Returns:
            dict: Contains call_prices, put_prices, spot_values, volatility_values
        """
        # TODO: Implement heatmap data generation
        # This will create the matrices for the heatmap visualization
        pass
