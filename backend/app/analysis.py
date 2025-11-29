import pandas as pd
import numpy as np

def calculate_sma(data: pd.DataFrame, period: int = 14, source: str = 'close') -> pd.Series:
    return data[source].rolling(window=period).mean()

def calculate_ema(data: pd.DataFrame, period: int = 14, source: str = 'close') -> pd.Series:
    return data[source].ewm(span=period, adjust=False).mean()

def calculate_rsi(data: pd.DataFrame, period: int = 14, source: str = 'close') -> pd.Series:
    delta = data[source].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(data: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9, source: str = 'close') -> pd.DataFrame:
    exp1 = data[source].ewm(span=fast, adjust=False).mean()
    exp2 = data[source].ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    return pd.DataFrame({'macd': macd, 'signal': signal_line, 'histogram': histogram})

def calculate_bollinger_bands(data: pd.DataFrame, period: int = 20, std_dev: int = 2, source: str = 'close') -> pd.DataFrame:
    sma = data[source].rolling(window=period).mean()
    std = data[source].rolling(window=period).std()
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    return pd.DataFrame({'upper': upper, 'middle': sma, 'lower': lower})

def calculate_indicators(data: list, indicators: list) -> dict:
    """
    Calculate requested indicators for the given data.
    data: list of dicts (from DataManager.load_data)
    indicators: list of dicts, e.g. [{"name": "SMA", "period": 14}]
    """
    if not data:
        return {}
        
    df = pd.DataFrame(data)
    # Ensure numeric
    cols = ['open', 'high', 'low', 'close', 'tick_volume']
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col])
            
    results = {}
    
    for ind in indicators:
        name = ind.get('name').upper()
        params = ind.get('params', {})
        
        if name == 'SMA':
            period = params.get('period', 14)
            results[f'SMA_{period}'] = calculate_sma(df, period).fillna(0).tolist()
            
        elif name == 'EMA':
            period = params.get('period', 14)
            results[f'EMA_{period}'] = calculate_ema(df, period).fillna(0).tolist()
            
        elif name == 'RSI':
            period = params.get('period', 14)
            results[f'RSI_{period}'] = calculate_rsi(df, period).fillna(0).tolist()
            
        elif name == 'MACD':
            fast = params.get('fast', 12)
            slow = params.get('slow', 26)
            signal = params.get('signal', 9)
            macd_df = calculate_macd(df, fast, slow, signal).fillna(0)
            results[f'MACD_{fast}_{slow}_{signal}'] = macd_df.to_dict('records')
            
        elif name == 'BB':
            period = params.get('period', 20)
            std_dev = params.get('std_dev', 2)
            bb_df = calculate_bollinger_bands(df, period, std_dev).fillna(0)
            results[f'BB_{period}_{std_dev}'] = bb_df.to_dict('records')
            
            
    return results

def calculate_account_stats(trades: list) -> dict:
    """
    Calculate account statistics from trade history.
    trades: list of dicts (from MT5Client.get_history_positions)
    """
    if not trades:
        return {
            "total_profit": 0.0,
            "win_rate": 0.0,
            "profit_factor": 0.0,
            "max_drawdown": 0.0,
            "total_trades": 0,
            "equity_curve": [],
            "monthly_pnl": []
        }

    df = pd.DataFrame(trades)
    
    # Filter for closed trades only
    df = df[df['status'] == 'CLOSED'].copy()
    
    if df.empty:
        return {
            "total_profit": 0.0,
            "win_rate": 0.0,
            "profit_factor": 0.0,
            "max_drawdown": 0.0,
            "total_trades": 0,
            "equity_curve": [],
            "monthly_pnl": []
        }

    # Ensure profit is float
    df['profit'] = pd.to_numeric(df['profit'])
    df['close_time'] = pd.to_datetime(df['close_time'], unit='s')
    
    # Sort by close time
    df = df.sort_values('close_time')

    # Basic Stats
    total_profit = df['profit'].sum()
    total_trades = len(df)
    wins = len(df[df['profit'] > 0])
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0.0
    
    gross_profit = df[df['profit'] > 0]['profit'].sum()
    gross_loss = abs(df[df['profit'] < 0]['profit'].sum())
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 999.0 if gross_profit > 0 else 0.0

    # Equity Curve & Drawdown
    df['cumulative_profit'] = df['profit'].cumsum()
    df['peak'] = df['cumulative_profit'].cummax()
    df['drawdown'] = df['peak'] - df['cumulative_profit']
    max_drawdown = df['drawdown'].max()

    equity_curve = []
    current_equity = 0.0 # Assuming starting from 0 relative profit
    
    # Add initial point
    if not df.empty:
        start_time = df.iloc[0]['close_time']
        equity_curve.append({"time": int(start_time.timestamp()), "value": 0.0})

    for _, row in df.iterrows():
        current_equity += row['profit']
        equity_curve.append({
            "time": int(row['close_time'].timestamp()),
            "value": round(current_equity, 2)
        })

    # Monthly PnL
    df['month'] = df['close_time'].dt.strftime('%Y-%m')
    monthly_pnl = df.groupby('month')['profit'].sum().reset_index()
    monthly_pnl_list = monthly_pnl.to_dict('records')

    return {
        "total_profit": round(total_profit, 2),
        "win_rate": round(win_rate, 2),
        "profit_factor": round(profit_factor, 2),
        "max_drawdown": round(max_drawdown, 2),
        "total_trades": total_trades,
        "equity_curve": equity_curve,
        "monthly_pnl": monthly_pnl_list
    }
