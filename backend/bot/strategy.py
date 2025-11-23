import pandas as pd

class Strategy:
    def __init__(self, short_window=10, long_window=20):
        self.short_window = short_window
        self.long_window = long_window

    def calculate_signal(self, df):
        """
        df should have 'close' column.
        Returns 'BUY', 'SELL', or None.
        """
        if len(df) < self.long_window:
            return None

        df['short_mavg'] = df['close'].rolling(window=self.short_window, min_periods=1).mean()
        df['long_mavg'] = df['close'].rolling(window=self.long_window, min_periods=1).mean()

        # Check for crossover in the last candle
        curr = df.iloc[-1]
        prev = df.iloc[-2]

        if prev['short_mavg'] < prev['long_mavg'] and curr['short_mavg'] > curr['long_mavg']:
            return 'BUY'
        elif prev['short_mavg'] > prev['long_mavg'] and curr['short_mavg'] < curr['long_mavg']:
            return 'SELL'
        
        return None
