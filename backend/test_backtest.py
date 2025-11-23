from bot.backtester import run_backtest
import logging

logging.basicConfig(level=logging.INFO)

def test():
    try:
        print("Starting backtest...")
        result = run_backtest(
            symbol="USDJPY",
            timeframe="M1",
            period_days=1, # Short period for test
            initial_cash=1000000,
            short_window=10,
            long_window=20
        )
        print("Backtest success!")
        print(result)
    except Exception as e:
        print(f"Backtest failed: {e}")

if __name__ == "__main__":
    test()
