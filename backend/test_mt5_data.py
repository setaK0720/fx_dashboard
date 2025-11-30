import MetaTrader5 as mt5
from datetime import datetime
from bot.config import load_account_config

# Load config
config = load_account_config()
account = config["AccountNumber"]
password = config["Password"]
server = config["Server"]
path = config["MT5Path"]

# Initialize
if not mt5.initialize(path=path):
    print(f"initialize() failed, error code = {mt5.last_error()}")
    quit()

# Login
authorized = mt5.login(account, password=password, server=server)
if not authorized:
    print(f"failed to connect at account #{account}, error code: {mt5.last_error()}")
    mt5.shutdown()
    quit()

print(f"Connected to {account}")

# Parameters
symbol = "GOLD"
timeframe = mt5.TIMEFRAME_M1
start_date = datetime(2025, 1, 1)
end_date = datetime(2025, 2, 1)

print(f"Requesting {symbol} M1 from {start_date} to {end_date}")

# Check if symbol exists
if not mt5.symbol_select(symbol, True):
    print(f"Failed to select {symbol}")
    # Try micro
    symbol = "GOLDmicro"
    if not mt5.symbol_select(symbol, True):
        print(f"Failed to select {symbol}")
        mt5.shutdown()
        quit()
    print(f"Using {symbol}")

# Get rates
rates = mt5.copy_rates_range(symbol, timeframe, start_date, end_date)

if rates is None:
    print(f"No data received (rates is None). Error: {mt5.last_error()}")
elif len(rates) == 0:
    print("Received 0 records")
else:
    print(f"Received {len(rates)} records")
    print(f"First: {datetime.fromtimestamp(rates[0]['time'])}")
    print(f"Last: {datetime.fromtimestamp(rates[-1]['time'])}")

mt5.shutdown()
