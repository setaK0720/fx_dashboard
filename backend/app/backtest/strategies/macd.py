from ..strategy import Strategy
import pandas as pd
import pandas_ta as ta

class MacdStrategy(Strategy):
    def init(self):
        fast = self.params.get('fast_period', 12)
        slow = self.params.get('slow_period', 26)
        signal = self.params.get('signal_period', 9)
        
        # Calculate MACD
        macd_df = ta.macd(self.data['close'], fast=fast, slow=slow, signal=signal)
        # pandas_ta returns columns like MACD_12_26_9, MACDh_12_26_9, MACDs_12_26_9
        # We need to rename or access dynamically.
        # Standard names: 
        # MACD line: MACD_...
        # Signal line: MACDs_...
        # Histogram: MACDh_...
        
        self.data['MACD'] = macd_df.iloc[:, 0] # First column is usually MACD line
        self.data['Signal'] = macd_df.iloc[:, 2] # Third column is usually Signal line (check pandas_ta docs or inspect)
        
        # Let's be safer and use column names if possible, but they depend on params.
        # iloc is risky if order changes. 
        # pandas_ta naming convention: MACD_{fast}_{slow}_{signal}, MACDh_..., MACDs_...
        self.data['MACD_Line'] = macd_df[f'MACD_{fast}_{slow}_{signal}']
        self.data['Signal_Line'] = macd_df[f'MACDs_{fast}_{slow}_{signal}']

    def next(self, i: int, record: dict):
        if i < 1: return
        
        macd = self.data['MACD_Line'].iloc[i]
        signal = self.data['Signal_Line'].iloc[i]
        prev_macd = self.data['MACD_Line'].iloc[i-1]
        prev_signal = self.data['Signal_Line'].iloc[i-1]
        
        if pd.isna(macd) or pd.isna(signal):
            return
            
        # Golden Cross (MACD crosses above Signal) -> BUY
        if prev_macd <= prev_signal and macd > signal:
            if self.position == 'SELL':
                self.close()
            if not self.position:
                self.buy(tp=record['close'] + 0.5, sl=record['close'] - 0.2)
                
        # Dead Cross (MACD crosses below Signal) -> SELL
        elif prev_macd >= prev_signal and macd < signal:
            if self.position == 'BUY':
                self.close()
            if not self.position:
                self.sell(tp=record['close'] - 0.5, sl=record['close'] + 0.2)

    @classmethod
    def get_params_schema(cls) -> list:
        return [
            {"name": "fast_period", "type": "number", "default": 12, "label": "Fast Period"},
            {"name": "slow_period", "type": "number", "default": 26, "label": "Slow Period"},
            {"name": "signal_period", "type": "number", "default": 9, "label": "Signal Period"}
        ]
