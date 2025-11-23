import pandas as pd
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
from bot.mt5_client import MT5Client

class SmaCross(Strategy):
    short_window = 10
    long_window = 20

    def init(self):
        price = self.data.Close
        self.ma1 = self.I(lambda x: pd.Series(x).rolling(self.short_window).mean(), price)
        self.ma2 = self.I(lambda x: pd.Series(x).rolling(self.long_window).mean(), price)

    def next(self):
        if crossover(self.ma1, self.ma2):
            self.buy()
        elif crossover(self.ma2, self.ma1):
            self.sell()

def run_backtest(symbol, timeframe, period_days, initial_cash, short_window, long_window):
    client = MT5Client()
    if not client.connect():
        raise Exception("Failed to connect to MT5")

    # Calculate number of candles (approx)
    # Assuming M1 for simplicity or mapping timeframe
    # For MVP, let's just fetch a fixed large number or calculate based on timeframe
    # period_days * 24 * 60 for M1
    num_candles = period_days * 1440 # Default to M1 count
    
    rates = client.get_historical_data(symbol, timeframe, num_candles)
    client.disconnect()

    if rates is None or len(rates) == 0:
        raise Exception("No data fetched")

    # Convert to DataFrame
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    df.set_index('time', inplace=True)
    
    # Rename columns for backtesting.py
    df.rename(columns={
        'open': 'Open',
        'high': 'High',
        'low': 'Low',
        'close': 'Close',
        'tick_volume': 'Volume'
    }, inplace=True)
    
    # Configure Strategy
    SmaCross.short_window = short_window
    SmaCross.long_window = long_window

    bt = Backtest(df, SmaCross, cash=initial_cash, commission=.002)
    stats = bt.run()
    
    # Extract equity curve
    equity_curve = stats._equity_curve
    equity_list = []
    for index, row in equity_curve.iterrows():
        equity_list.append({
            "time": index.strftime("%Y-%m-%d %H:%M"),
            "equity": row['Equity']
        })

    return {
        "return_pct": stats['Return [%]'],
        "win_rate": stats['Win Rate [%]'],
        "profit_factor": stats['Profit Factor'],
        "trades": stats['# Trades'],
        "equity_curve": equity_list
    }
