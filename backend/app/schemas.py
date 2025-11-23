from pydantic import BaseModel
from typing import Literal

class OrderCreate(BaseModel):
    symbol: str
    order_type: Literal["BUY", "SELL"]
    volume: float

class OrderResponse(BaseModel):
    order_id: str
    status: str
    message: str

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    period_days: int = 30
    initial_cash: float = 1000000
    short_window: int = 10
    long_window: int = 20

class BacktestResponse(BaseModel):
    return_pct: float
    win_rate: float
    profit_factor: float
    trades: int
    equity_curve: list[dict] # [{"time": "...", "equity": 1000000}, ...]

