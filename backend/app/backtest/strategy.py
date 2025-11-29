from abc import ABC, abstractmethod
import pandas as pd

class Strategy(ABC):
    def __init__(self, data: pd.DataFrame, params: dict = None):
        self.data = data
        self.params = params or {}
        self.position = None # Current position: 'BUY', 'SELL', or None
        self.entry_price = 0.0
        self.entry_time = None
        self.orders = [] # List of orders to be executed by engine

    @abstractmethod
    def init(self):
        """Initialize indicators and other setup"""
        pass

    @abstractmethod
    def next(self, i: int, record: dict):
        """Called for each candle"""
        pass

    def buy(self, sl: float = None, tp: float = None):
        """Signal to open a BUY position"""
        self.orders.append({
            "type": "BUY",
            "sl": sl,
            "tp": tp
        })

    def sell(self, sl: float = None, tp: float = None):
        """Signal to open a SELL position"""
        self.orders.append({
            "type": "SELL",
            "sl": sl,
            "tp": tp
        })

    def close(self):
        """Signal to close the current position"""
        self.orders.append({
            "type": "CLOSE"
        })
