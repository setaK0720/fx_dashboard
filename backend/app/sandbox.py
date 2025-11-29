import pandas as pd
from typing import List, Dict, Any
from app.analysis import calculate_indicators

def run_sandbox_backtest(data: list, conditions: List[Dict[str, Any]], tp_pips: float = 20, sl_pips: float = 20) -> Dict[str, Any]:
    """
    Run a simple backtest based on conditions.
    
    conditions: List of dicts, e.g.
    [
        {"indicator": "RSI_14", "operator": "<", "value": 30, "action": "BUY"},
        {"indicator": "RSI_14", "operator": ">", "value": 70, "action": "SELL"}
    ]
    """
    if not data:
        return {"error": "No data provided"}

    df = pd.DataFrame(data)
    # Ensure numeric
    cols = ['open', 'high', 'low', 'close', 'tick_volume']
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col])

    # 1. Calculate necessary indicators
    # Extract unique indicators needed
    needed_indicators = []
    for cond in conditions:
        ind_name = cond['indicator']
        # Parse indicator name to get params (simple parsing for now)
        # Assumes format like "RSI_14", "SMA_20"
        parts = ind_name.split('_')
        name = parts[0]
        if name == 'RSI':
            needed_indicators.append({"name": "RSI", "params": {"period": int(parts[1])}})
        elif name == 'SMA':
            needed_indicators.append({"name": "SMA", "params": {"period": int(parts[1])}})
        # Add more as needed

    # Calculate indicators
    indicators_data = calculate_indicators(data, needed_indicators)
    
    # Merge indicators into DataFrame
    for key, values in indicators_data.items():
        df[key] = values

    # 2. Simulate Trades
    trades = []
    active_position = None # {'type': 'BUY'/'SELL', 'open_price': float, 'open_time': str}
    
    # Simple loop (can be optimized later)
    for i in range(len(df)):
        row = df.iloc[i]
        
        # Check Exit (TP/SL) if position exists
        if active_position:
            entry_price = active_position['open_price']
            current_low = row['low']
            current_high = row['high']
            
            pips_multiplier = 0.01 if 'JPY' in "USDJPY" else 0.0001 # TODO: Pass symbol to handle this correctly
            # For now assuming JPY pairs or standardizing
            # Let's use a fixed multiplier for simplicity or pass it in. 
            # Better: Calculate profit in price diff and convert to pips later.
            
            # Simple TP/SL check (checking High/Low of current candle)
            # This is optimistic/pessimistic approximation
            
            if active_position['type'] == 'BUY':
                # Hit SL?
                if current_low <= entry_price - (sl_pips * pips_multiplier):
                    trades.append({
                        "type": "BUY",
                        "entry_time": active_position['open_time'],
                        "exit_time": row['time'],
                        "entry_price": entry_price,
                        "exit_price": entry_price - (sl_pips * pips_multiplier),
                        "profit_pips": -sl_pips,
                        "result": "LOSS"
                    })
                    active_position = None
                # Hit TP?
                elif current_high >= entry_price + (tp_pips * pips_multiplier):
                    trades.append({
                        "type": "BUY",
                        "entry_time": active_position['open_time'],
                        "exit_time": row['time'],
                        "entry_price": entry_price,
                        "exit_price": entry_price + (tp_pips * pips_multiplier),
                        "profit_pips": tp_pips,
                        "result": "WIN"
                    })
                    active_position = None
            
            elif active_position['type'] == 'SELL':
                # Hit SL?
                if current_high >= entry_price + (sl_pips * pips_multiplier):
                    trades.append({
                        "type": "SELL",
                        "entry_time": active_position['open_time'],
                        "exit_time": row['time'],
                        "entry_price": entry_price,
                        "exit_price": entry_price + (sl_pips * pips_multiplier),
                        "profit_pips": -sl_pips,
                        "result": "LOSS"
                    })
                    active_position = None
                # Hit TP?
                elif current_low <= entry_price - (tp_pips * pips_multiplier):
                    trades.append({
                        "type": "SELL",
                        "entry_time": active_position['open_time'],
                        "exit_time": row['time'],
                        "entry_price": entry_price,
                        "exit_price": entry_price - (tp_pips * pips_multiplier),
                        "profit_pips": tp_pips,
                        "result": "WIN"
                    })
                    active_position = None

        # Check Entry Conditions (only if no active position)
        if not active_position:
            for cond in conditions:
                ind_val = row.get(cond['indicator'])
                if ind_val is None: continue
                
                target_val = cond['value']
                op = cond['operator']
                
                match = False
                if op == '<': match = ind_val < target_val
                elif op == '>': match = ind_val > target_val
                elif op == '<=': match = ind_val <= target_val
                elif op == '>=': match = ind_val >= target_val
                elif op == '==': match = ind_val == target_val
                
                if match:
                    active_position = {
                        "type": cond['action'],
                        "open_price": row['close'], # Enter at close of signal candle
                        "open_time": row['time']
                    }
                    break # Take first matching signal

    # 3. Calculate Stats
    total_trades = len(trades)
    wins = len([t for t in trades if t['result'] == 'WIN'])
    losses = total_trades - wins
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    total_pips = sum([t['profit_pips'] for t in trades])
    
    return {
        "total_trades": total_trades,
        "win_rate": round(win_rate, 2),
        "total_pips": round(total_pips, 2),
        "wins": wins,
        "losses": losses,
        "trades": trades
    }
