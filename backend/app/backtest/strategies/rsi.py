from ..strategy import Strategy
import pandas as pd
import pandas_ta as ta

class RsiStrategy(Strategy):
    def init(self):
        period = self.params.get('period', 14)
        self.data['RSI'] = ta.rsi(self.data['close'], length=period)
        
    def next(self, i: int, record: dict):
        if i < 1: return
        
        rsi = self.data['RSI'].iloc[i]
        prev_rsi = self.data['RSI'].iloc[i-1]
        
        if pd.isna(rsi) or pd.isna(prev_rsi):
            return
            
        upper_bound = self.params.get('upper_bound', 70)
        lower_bound = self.params.get('lower_bound', 30)
        
        # RSI crosses below upper bound -> SELL (Overbought reversal)
        if prev_rsi >= upper_bound and rsi < upper_bound:
            if self.position == 'BUY':
                self.close()
            if not self.position:
                self.sell(tp=record['close'] - 0.5, sl=record['close'] + 0.2)
                
        # RSI crosses above lower bound -> BUY (Oversold reversal)
        elif prev_rsi <= lower_bound and rsi > lower_bound:
            if self.position == 'SELL':
                self.close()
            if not self.position:
                self.buy(tp=record['close'] + 0.5, sl=record['close'] - 0.2)

    @classmethod
    def get_params_schema(cls) -> list:
        return [
            {"name": "period", "type": "number", "default": 14, "label": "RSI Period"},
            {"name": "upper_bound", "type": "number", "default": 70, "label": "Overbought Level"},
            {"name": "lower_bound", "type": "number", "default": 30, "label": "Oversold Level"}
        ]
