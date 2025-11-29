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
        self.symbol_map = {}  # シンボルマッピングキャッシュ

    def connect(self):
        if not mt5.initialize(path=self.path):
            logger.error(f"initialize() failed, error code = {mt5.last_error()}")
            return False

        authorized = mt5.login(self.account, password=self.password, server=self.server)
        if authorized:
            logger.info(f"Connected to {self.account} on {self.server}")
            self.connected = True
            self.symbol_map = {}  # 接続時にキャッシュをクリア
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
    
    def check_symbol_exists(self, symbol):
        """MT5でシンボルが利用可能かチェック"""
        if not self.connected:
            return False
        
        symbol_info = mt5.symbol_info(symbol)
        return symbol_info is not None
    
    def normalize_symbol(self, symbol):
        """Normalize symbol name for broker (e.g., XAUUSD -> GOLD or GOLDmicro)"""
        # キャッシュをチェック
        if symbol in self.symbol_map:
            return self.symbol_map[symbol]
        
        # XM broker用の変換
        if self.server and "XMTrading" in self.server:
            # XAUUSDの変換
            if symbol == "XAUUSD":
                # micro版が存在するかチェック
                if self.check_symbol_exists("GOLDmicro"):
                    logger.info(f"Using GOLDmicro for {symbol}")
                    self.symbol_map[symbol] = "GOLDmicro"
                    return "GOLDmicro"
                # 通常版をチェック
                elif self.check_symbol_exists("GOLD"):
                    logger.info(f"Using GOLD for {symbol}")
                    self.symbol_map[symbol] = "GOLD"
                    return "GOLD"
            
            # USDJPYの変換（microバージョンをチェック）
            elif symbol == "USDJPY":
                if self.check_symbol_exists("USDJPYmicro"):
                    logger.info(f"Using USDJPYmicro for {symbol}")
                    self.symbol_map[symbol] = "USDJPYmicro"
                    return "USDJPYmicro"
            
            # EURUSDの変換（microバージョンをチェック）
            elif symbol == "EURUSD":
                if self.check_symbol_exists("EURUSDmicro"):
                    logger.info(f"Using EURUSDmicro for {symbol}")
                    self.symbol_map[symbol] = "EURUSDmicro"
                    return "EURUSDmicro"
            
            # BTCUSDはmicroバージョンなし、そのまま使用
        
        # デフォルトは元のシンボル
        self.symbol_map[symbol] = symbol
        return symbol

    def get_rates(self, symbol):
        if not self.connected:
            return None
        
        # Normalize symbol for broker (e.g., XAUUSD -> GOLD for XM)
        normalized_symbol = self.normalize_symbol(symbol)
        
        # Ensure symbol is selected
        if not mt5.symbol_select(normalized_symbol, True):
            logger.warning(f"Failed to select symbol {normalized_symbol}")
            return None
        
        tick = mt5.symbol_info_tick(normalized_symbol)
        if tick is None:
            logger.warning(f"Failed to get tick for {normalized_symbol}")
            return None
        
        return {
            "symbol": symbol,  # Return original symbol name for frontend
            "bid": tick.bid,
            "ask": tick.ask,
            "spread": int(round((tick.ask - tick.bid) / mt5.symbol_info(normalized_symbol).point)) if mt5.symbol_info(normalized_symbol) else 0,
            "time": tick.time
        }

    def get_account_info(self):
        if not self.connected:
            return None
        
        info = mt5.account_info()
        if info is None:
            logger.warning("Failed to get account info")
            return None
        
        return {
            "balance": info.balance,
            "equity": info.equity,
            "margin": info.margin,
            "margin_free": info.margin_free,
            "margin_level": info.margin_level,
            "profit": info.profit,
            "credit": info.credit,
            "currency": info.currency,
            "leverage": info.leverage,
            "name": info.name,
            "server": info.server,
            "login": info.login
        }

    def get_positions(self):
        if not self.connected:
            return []
        
        positions = mt5.positions_get()
        if positions is None:
            return []
        
        result = []
        for pos in positions:
            # MT5 server time is GMT+2 (XMTrading), need to convert to UTC
            # pos.time is in server local time but represented as Unix timestamp
            # We need to subtract the server offset to get true UTC
            server_offset_hours = 2  # XMTrading is GMT+2 (GMT+3 during summer time)
            utc_time = pos.time - (server_offset_hours * 3600)
            
            result.append({
                "id": pos.ticket,
                "symbol": pos.symbol,
                "type": "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL",
                "volume": pos.volume,
                "open_price": pos.price_open,
                "current_price": pos.price_current,
                "time": utc_time,  # Now in UTC
                "profit": pos.profit
            })
        return result

    def place_order(self, symbol, order_type, volume, sl=None, tp=None):
        if not self.connected:
            return {"status": "error", "message": "Not connected to MT5"}

        normalized_symbol = self.normalize_symbol(symbol)
        
        # Ensure symbol is selected
        if not mt5.symbol_select(normalized_symbol, True):
             return {"status": "error", "message": f"Failed to select symbol {normalized_symbol}"}

        tick = mt5.symbol_info_tick(normalized_symbol)
        if tick is None:
            return {"status": "error", "message": f"Failed to get tick for {normalized_symbol}"}

        action = mt5.TRADE_ACTION_DEAL
        type_op = mt5.ORDER_TYPE_BUY if order_type == "BUY" else mt5.ORDER_TYPE_SELL
        price = tick.ask if order_type == "BUY" else tick.bid
        
        request = {
            "action": action,
            "symbol": normalized_symbol,
            "volume": volume,
            "type": type_op,
            "price": price,
            "deviation": 20,
            "magic": 234000,
            "comment": "python script open",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        
        if sl:
            request["sl"] = sl
        if tp:
            request["tp"] = tp

        result = mt5.order_send(request)
        
        if result is None:
             return {"status": "error", "message": "Order send failed (unknown error)"}
        
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Order failed: {result.comment} ({result.retcode})")
            return {"status": "error", "message": f"Order failed: {result.comment}"}
        
        logger.info(f"Order placed: {result.order}")
        return {
            "status": "success", 
            "message": "Order placed successfully", 
            "order_id": result.order,
            "price": result.price
        }

    def close_position(self, ticket: int):
        """Close a position by ticket number"""
        if not self.connected:
            return {"status": "error", "message": "Not connected to MT5"}
        
        # Get position info
        position = mt5.positions_get(ticket=ticket)
        if position is None or len(position) == 0:
            return {"status": "error", "message": f"Position {ticket} not found"}
        
        position = position[0]
        
        # Determine opposite order type
        order_type = mt5.ORDER_TYPE_SELL if position.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
        
        # Get current price
        tick = mt5.symbol_info_tick(position.symbol)
        if tick is None:
            return {"status": "error", "message": f"Failed to get tick for {position.symbol}"}
        
        price = tick.bid if position.type == mt5.ORDER_TYPE_BUY else tick.ask
        
        # Create close request
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": position.symbol,
            "volume": position.volume,
            "type": order_type,
            "position": ticket,
            "price": price,
            "deviation": 20,
            "magic": 234000,
            "comment": "python close position",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        
        result = mt5.order_send(request)
        
        if result is None:
            return {"status": "error", "message": "Close order failed (unknown error)"}
        
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Close failed: {result.comment} ({result.retcode})")
            return {"status": "error", "message": f"Close failed: {result.comment}"}
        
        logger.info(f"Position {ticket} closed successfully")
        return {
            "status": "success",
            "message": "Position closed successfully",
            "ticket": ticket
        }

    def close_all_positions(self, position_type=None):
        """
        Close all positions, optionally filtered by type.
        position_type: 'BUY', 'SELL', or None (for all)
        """
        if not self.connected:
            return {"status": "error", "message": "Not connected to MT5"}

        positions = self.get_positions()
        if not positions:
            return {"status": "success", "message": "No positions to close", "closed_count": 0}

        target_type = None
        if position_type == "BUY":
            target_type = "BUY"
        elif position_type == "SELL":
            target_type = "SELL"

        closed_count = 0
        errors = []

        for pos in positions:
            if target_type and pos["type"] != target_type:
                continue
            
            result = self.close_position(pos["id"])
            if result["status"] == "success":
                closed_count += 1
            else:
                errors.append(f"Ticket {pos['id']}: {result['message']}")

        return {
            "status": "success" if not errors else "partial_success",
            "message": f"Closed {closed_count} positions",
            "closed_count": closed_count,
            "errors": errors
        }

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

    def get_candles_range(self, symbol, timeframe, from_date, to_date):
        """
        Get historical candles for a specific date range.
        from_date, to_date: datetime objects
        """
        if not self.connected:
            return None
        
        # Map timeframe
        tf_map = {
            "M1": mt5.TIMEFRAME_M1,
            "M5": mt5.TIMEFRAME_M5,
            "M15": mt5.TIMEFRAME_M15,
            "M30": mt5.TIMEFRAME_M30,
            "H1": mt5.TIMEFRAME_H1,
            "H4": mt5.TIMEFRAME_H4,
            "D1": mt5.TIMEFRAME_D1,
        }
        mt5_tf = tf_map.get(timeframe, mt5.TIMEFRAME_M1)

        # Normalize symbol
        normalized_symbol = self.normalize_symbol(symbol)

        # Ensure symbol is selected
        if not mt5.symbol_select(normalized_symbol, True):
            logger.error(f"Failed to select symbol {normalized_symbol}")
            return None

        rates = mt5.copy_rates_range(normalized_symbol, mt5_tf, from_date, to_date)
        if rates is None:
            logger.error(f"Failed to get rates range for {normalized_symbol} (Error: {mt5.last_error()})")
            return None
        
        return rates

    def get_history_deals(self, from_date, to_date):
        """
        Get history deals within the specified range.
        from_date, to_date: datetime objects (timezone-aware or naive)
        """
        if not self.connected:
            return []
        
        # Ensure dates are timezone-aware (UTC) if not already, or handle as needed
        # MT5 expects datetime objects
        deals = mt5.history_deals_get(from_date, to_date)
        
        if deals is None:
            logger.warning(f"Failed to get history deals, error code: {mt5.last_error()}")
            return []
        
        result = []
        for deal in deals:
            # Filter out non-trading deals if necessary (e.g., balance operations)
            # Entry 0 is IN, 1 is OUT, 2 is IN/OUT
            # Deal types: 0=BUY, 1=SELL, 2=BALANCE, etc.
            
            # Convert time to UTC (similar to get_positions)
            server_offset_hours = 2
            utc_time = deal.time - (server_offset_hours * 3600)
            
            result.append({
                "ticket": deal.ticket,
                "order": deal.order,
                "time": utc_time,
                "time_msc": deal.time_msc,
                "type": "BUY" if deal.type == mt5.ORDER_TYPE_BUY else "SELL" if deal.type == mt5.ORDER_TYPE_SELL else str(deal.type),
                "entry": "IN" if deal.entry == mt5.DEAL_ENTRY_IN else "OUT" if deal.entry == mt5.DEAL_ENTRY_OUT else "IN/OUT" if deal.entry == mt5.DEAL_ENTRY_INOUT else "OUT_BY",
                "symbol": deal.symbol,
                "volume": deal.volume,
                "price": deal.price,
                "commission": deal.commission,
                "swap": deal.swap,
                "profit": deal.profit,
                "comment": deal.comment
            })
        
        # Sort by time descending
        result.sort(key=lambda x: x["time"], reverse=True)
        return result

    def get_history_positions(self, from_date, to_date):
        """
        Get history positions (aggregated deals) within the specified range.
        """
        deals = self.get_history_deals(from_date, to_date)
        if not deals:
            return []

        positions = {}
        
        for deal in deals:
            # Skip balance operations if they don't have a position ID or if we want to exclude them
            # Usually balance ops have entry=IN but type=BALANCE (2)
            # We focus on BUY/SELL
            
            # deal structure from get_history_deals:
            # ticket, order, time, type, entry, symbol, volume, price, commission, swap, profit
            
            # We need raw deal info to group by position_id, but get_history_deals returns processed dicts.
            # However, get_history_deals doesn't return position_id. 
            # We need to modify get_history_deals or access raw deals here.
            # Let's use raw mt5.history_deals_get here for flexibility.
            pass

        # Re-implementing logic using raw calls to ensure we have position_id
        if not self.connected:
            return []
            
        raw_deals = mt5.history_deals_get(from_date, to_date)
        if raw_deals is None:
            return []

        # Group by position_id
        pos_map = {}
        
        for deal in raw_deals:
            pid = deal.position_id
            if pid == 0: # Balance/Credit operations usually have 0 or unique
                continue
                
            if pid not in pos_map:
                pos_map[pid] = []
            pos_map[pid].append(deal)
            
        results = []
        server_offset_hours = 2
        
        for pid, deals in pos_map.items():
            # Sort deals by time
            deals.sort(key=lambda x: x.time)
            
            # Identify Entry (IN) and Exit (OUT)
            # Simple assumption: First deal is Open, Last deal is Close
            # Or check entry type
            
            open_deal = None
            close_deal = None
            
            total_profit = 0.0
            total_swap = 0.0
            total_commission = 0.0
            total_volume = 0.0
            
            for d in deals:
                total_profit += d.profit
                total_swap += d.swap
                total_commission += d.commission
                
                if d.entry == mt5.DEAL_ENTRY_IN:
                    open_deal = d
                elif d.entry == mt5.DEAL_ENTRY_OUT or d.entry == mt5.DEAL_ENTRY_OUT_BY:
                    close_deal = d
                    total_volume += d.volume # Sum volume of closing deals? Or just take the last one?
            
            # If we don't have a close deal, the position might still be open (but history_deals usually contains closed ones? or partials?)
            # If it's still open, it shouldn't be in history if we only want closed positions?
            # Actually history_deals_get returns deals. Open positions are in positions_get.
            # If a position is fully closed, we should have IN and OUT.
            
            if not open_deal:
                continue # Should not happen for valid trades
                
            # If no close deal, maybe it's a partial close or something, or just opened in this period?
            # If we want only CLOSED positions, we need to check if it's closed.
            # But user wants history.
            
            # Use open_deal for symbol, type
            # Use close_deal for close time/price
            
            utc_open_time = open_deal.time - (server_offset_hours * 3600)
            utc_close_time = (close_deal.time - (server_offset_hours * 3600)) if close_deal else None
            
            results.append({
                "position_id": pid,
                "symbol": open_deal.symbol,
                "type": "BUY" if open_deal.type == mt5.ORDER_TYPE_BUY else "SELL",
                "volume": open_deal.volume, # Initial volume
                "open_price": open_deal.price,
                "open_time": utc_open_time,
                "close_price": close_deal.price if close_deal else 0.0,
                "close_time": utc_close_time,
                "profit": total_profit + total_swap + total_commission, # Net profit
                "swap": total_swap,
                "commission": total_commission,
                "status": "CLOSED" if close_deal else "OPEN" # Just in case
            })
            
        # Sort by close time descending (most recent closed first)
        results.sort(key=lambda x: x["close_time"] if x["close_time"] else 0, reverse=True)
        return results
