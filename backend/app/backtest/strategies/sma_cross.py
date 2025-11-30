from ..strategy import Strategy
import pandas as pd

class SmaCrossStrategy(Strategy):
    def init(self):
        # Calculate indicators
        short_window = self.params.get('short_window', 10)
        long_window = self.params.get('long_window', 30)
        
        self.data['SMA_Short'] = self.data['close'].rolling(window=short_window).mean()
        self.data['SMA_Long'] = self.data['close'].rolling(window=long_window).mean()
        
    def next(self, i: int, record: dict):
        if i < 1: return
        
        # Get current and previous values
        current_short = self.data['SMA_Short'].iloc[i]
        current_long = self.data['SMA_Long'].iloc[i]
        prev_short = self.data['SMA_Short'].iloc[i-1]
        prev_long = self.data['SMA_Long'].iloc[i-1]
        
        if pd.isna(current_short) or pd.isna(current_long):
            return
            
        # Golden Cross (Short crosses above Long) -> BUY
        if prev_short <= prev_long and current_short > current_long:
            if self.position == 'SELL':
                self.close()
            if not self.position:
                self.buy(tp=record['close'] + 0.5, sl=record['close'] - 0.2) # Example TP/SL
                
        # Dead Cross (Short crosses below Long) -> SELL
        elif prev_short >= prev_long and current_short < current_long:
            if self.position == 'BUY':
                self.close()
            if not self.position:
                self.sell(tp=record['close'] - 0.5, sl=record['close'] + 0.2)

    @classmethod
    def get_params_schema(cls) -> list:
        return [
            {"name": "short_window", "type": "number", "default": 10, "label": "Short Window (SMA)"},
            {"name": "long_window", "type": "number", "default": 30, "label": "Long Window (SMA)"}
        ]
