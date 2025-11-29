import pandas as pd
from typing import Type, List, Dict
from .strategy import Strategy

class BacktestEngine:
    def __init__(self, data: pd.DataFrame, strategy_class: Type[Strategy], initial_cash: float = 10000.0, params: dict = None):
        self.data = data.copy()
        self.strategy_class = strategy_class
        self.initial_cash = initial_cash
        self.params = params or {}
        
        # Ensure data is sorted and has necessary columns
        if 'time' in self.data.columns:
            self.data['time'] = pd.to_datetime(self.data['time'])
            self.data = self.data.sort_values('time').reset_index(drop=True)
        
        self.trades = []
        self.equity_curve = []
        self.current_equity = initial_cash
        self.current_balance = initial_cash
        
        # Position state
        self.position = None # { 'type': 'BUY'|'SELL', 'price': float, 'size': float, 'sl': float, 'tp': float, 'time': datetime }
        
    def run(self):
        strategy = self.strategy_class(self.data, self.params)
        strategy.init()
        
        records = self.data.to_dict('records')
        
        for i, record in enumerate(records):
            # Update current equity based on open position
            self._update_equity(record)
            
            # Check for bankruptcy
            if self.current_equity <= 0:
                if self.position:
                    self._close_position(record['close'], record['time'], 'Bankruptcy')
                break

            # Pass current position state to strategy
            strategy.position = self.position['type'] if self.position else None
            strategy.entry_price = self.position['price'] if self.position else 0.0
            strategy.entry_time = self.position['time'] if self.position else None
            strategy.orders = [] # Clear previous orders
            
            # Run strategy logic
            strategy.next(i, record)
            
            # Process orders from strategy
            self._process_orders(strategy.orders, record)
            
            # Check TP/SL
            self._check_tpsl(record)
            
            # Record equity
            self.equity_curve.append({
                "time": record['time'],
                "equity": self.current_equity,
                "balance": self.current_balance
            })
            
        return self._generate_results()

    def _update_equity(self, record):
        if not self.position:
            self.current_equity = self.current_balance
            return

        price = record['close']
        diff = 0.0
        
        if self.position['type'] == 'BUY':
            diff = price - self.position['price']
        elif self.position['type'] == 'SELL':
            diff = self.position['price'] - price
            
        # Simplified profit calculation (ignoring spread/commissions for now)
        # Assuming 1 lot = 100,000 units, but let's stick to pips or simple price diff * size
        # For simplicity in this engine, let's assume size is "units"
        profit = diff * self.position['size']
        self.current_equity = self.current_balance + profit

    def _process_orders(self, orders: List[Dict], record):
        for order in orders:
            if order['type'] == 'CLOSE':
                self._close_position(record['close'], record['time'], 'Signal Close')
            elif order['type'] in ['BUY', 'SELL']:
                if self.position:
                    # Close existing position if direction changes or just ignore?
                    # For simplicity, close existing first if opposite? Or just ignore.
                    # Let's assume one position at a time.
                    continue
                
                self._open_position(order['type'], record['close'], record['time'], order.get('sl'), order.get('tp'))

    def _open_position(self, type, price, time, sl, tp):
        # Determine size (simple fixed size or based on risk)
        # For now, fixed 0.1 lot (10000 units)
        size = 10000 
        
        self.position = {
            'type': type,
            'price': price,
            'size': size,
            'sl': sl,
            'tp': tp,
            'time': time
        }
        
    def _close_position(self, price, time, reason):
        if not self.position:
            return
            
        diff = 0.0
        if self.position['type'] == 'BUY':
            diff = price - self.position['price']
        elif self.position['type'] == 'SELL':
            diff = self.position['price'] - price
            
        profit = diff * self.position['size']
        self.current_balance += profit
        self.current_equity = self.current_balance
        
        self.trades.append({
            'type': self.position['type'],
            'entry_price': self.position['price'],
            'exit_price': price,
            'entry_time': self.position['time'],
            'exit_time': time,
            'profit': profit,
            'reason': reason
        })
        
        self.position = None

    def _check_tpsl(self, record):
        if not self.position:
            return
            
        # Check SL
        if self.position['sl']:
            if self.position['type'] == 'BUY' and record['low'] <= self.position['sl']:
                self._close_position(self.position['sl'], record['time'], 'SL')
                return
            elif self.position['type'] == 'SELL' and record['high'] >= self.position['sl']:
                self._close_position(self.position['sl'], record['time'], 'SL')
                return
                
        # Check TP
        if self.position['tp']:
            if self.position['type'] == 'BUY' and record['high'] >= self.position['tp']:
                self._close_position(self.position['tp'], record['time'], 'TP')
                return
            elif self.position['type'] == 'SELL' and record['low'] <= self.position['tp']:
                self._close_position(self.position['tp'], record['time'], 'TP')
                return

    def _generate_results(self):
        total_trades = len(self.trades)
        wins = len([t for t in self.trades if t['profit'] > 0])
        losses = len([t for t in self.trades if t['profit'] <= 0])
        win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
        
        total_profit = sum([t['profit'] for t in self.trades])
        
        gross_profit = sum([t['profit'] for t in self.trades if t['profit'] > 0])
        gross_loss = abs(sum([t['profit'] for t in self.trades if t['profit'] < 0]))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 999.0 if gross_profit > 0 else 0
        
        # Max Drawdown
        equity_series = pd.Series([e['equity'] for e in self.equity_curve])
        peak = equity_series.cummax()
        drawdown = peak - equity_series
        max_drawdown = drawdown.max()
        
        return {
            "total_trades": total_trades,
            "win_rate": round(win_rate, 2),
            "total_profit": round(total_profit, 2),
            "profit_factor": round(profit_factor, 2),
            "max_drawdown": round(max_drawdown, 2),
            "trades": self.trades,
            "equity_curve": self.equity_curve
        }
