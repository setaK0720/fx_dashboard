import MetaTrader5 as mt5
from bot.config import load_account_config, TARGET_ACCOUNT
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MT5Client:
    def __init__(self):
        self.config = load_account_config()
        self.account = self.config["AccountNumber"]
        self.password = self.config["Password"]
        self.server = self.config["Server"]
        self.path = self.config["MT5Path"]
        self.current_account_name = TARGET_ACCOUNT
        self.connected = False

    def connect(self):
        if not mt5.initialize(path=self.path):
            logger.error(f"initialize() failed, error code = {mt5.last_error()}")
            return False

        authorized = mt5.login(self.account, password=self.password, server=self.server)
        if authorized:
            logger.info(f"Connected to {self.account} on {self.server}")
            self.connected = True
        else:
            logger.error(f"failed to connect at account #{self.account}, error code: {mt5.last_error()}")
            self.connected = False
        
        return self.connected

    def disconnect(self):
        mt5.shutdown()
        self.connected = False
        logger.info("Disconnected from MT5")

    def switch_account(self, account_name):
        logger.info(f"Switching to account: {account_name}")
        if self.connected:
            self.disconnect()
        
        try:
            self.config = load_account_config(account_name)
            self.account = self.config["AccountNumber"]
            self.password = self.config["Password"]
            self.server = self.config["Server"]
            self.path = self.config["MT5Path"]
            self.current_account_name = account_name
            return self.connect()
        except Exception as e:
            logger.error(f"Failed to switch account: {e}")
            return False

    def get_rates(self, symbol):
        if not self.connected:
            return None
        
        # Ensure symbol is selected
        if not mt5.symbol_select(symbol, True):
            logger.warning(f"Failed to select symbol {symbol}")
            return None
        
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            logger.warning(f"Failed to get tick for {symbol}")
            return None
        
        return {
            "symbol": symbol,
            "bid": tick.bid,
            "ask": tick.ask,
            "spread": int(round((tick.ask - tick.bid) / mt5.symbol_info(symbol).point)) if mt5.symbol_info(symbol) else 0,
            "time": tick.time
        }

    def get_positions(self):
        if not self.connected:
            return []
        
        positions = mt5.positions_get()
        if positions is None:
            return []
        
        result = []
        for pos in positions:
            result.append({
                "id": pos.ticket,
                "symbol": pos.symbol,
                "type": "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL",
                "volume": pos.volume,
                "open_price": pos.price_open,
                "current_price": pos.price_current,
                "time": pos.time,
                "profit": pos.profit
            })
        return result

    def get_historical_data(self, symbol, timeframe, num_candles=1000):
        if not self.connected:
            return None
        
        # Map timeframe to MT5 constant (simplified)
        tf_map = {
            "M1": mt5.TIMEFRAME_M1,
            "M5": mt5.TIMEFRAME_M5,
            "H1": mt5.TIMEFRAME_H1,
            "D1": mt5.TIMEFRAME_D1,
        }
        mt5_tf = tf_map.get(timeframe, mt5.TIMEFRAME_M1)

        # Normalize symbol (remove /)
        symbol = symbol.replace("/", "")

        # Ensure symbol is selected
        if not mt5.symbol_select(symbol, True):
            logger.error(f"Failed to select symbol {symbol}")
            return None

        rates = mt5.copy_rates_from_pos(symbol, mt5_tf, 0, num_candles)
        if rates is None:
            logger.error(f"Failed to get historical data for {symbol}")
            return None
        
        return rates


