from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import init_db, get_db
from app.models.base import BotStatus, Position
from sqlalchemy import select
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Handle disconnected clients gracefully
                pass

price_manager = ConnectionManager()
account_manager = ConnectionManager()

import asyncio
import json
import random

import uuid
from app.schemas import OrderCreate, OrderResponse
from bot.auto_close import AutoCloseManager, AutoCloseSettings
from bot.mt5_client import MT5Client

# ... (existing code) ...

@app.post("/api/orders", response_model=OrderResponse)
async def place_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    # Call MT5 client to place order (offload to thread)
    result = await asyncio.to_thread(
        mt5_client.place_order,
        symbol=order.symbol,
        order_type=order.order_type,
        volume=order.volume
    )
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    
    return OrderResponse(
        order_id=str(result.get("order_id", "")),
        status="FILLED",
        message=result["message"]
    )

@app.delete("/api/positions/{ticket}")
async def close_position(ticket: int):
    result = await asyncio.to_thread(mt5_client.close_position, ticket)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.delete("/api/positions")
async def close_all_positions(type: str = "ALL"):
    """
    Close all positions.
    type: 'ALL', 'BUY', or 'SELL'
    """
    position_type = None
    if type == "BUY":
        position_type = "BUY"
    elif type == "SELL":
        position_type = "SELL"
    
    result = await asyncio.to_thread(mt5_client.close_all_positions, position_type)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

from app.backtest.engine import BacktestEngine
from app.backtest.strategies.sma_cross import SmaCrossStrategy
from app.backtest.strategies.rsi import RsiStrategy
from app.backtest.strategies.macd import MacdStrategy
from app.backtest.strategies.builder_strategy import BuilderStrategy
from app.strategy_manager import StrategyManager

strategy_manager = StrategyManager()

# Standard strategies
STRATEGIES = {
    "SmaCross": SmaCrossStrategy,
    "Rsi": RsiStrategy,
    "Macd": MacdStrategy
}

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    strategy: str
    params: dict = {}
    start_date: str
    end_date: str
    initial_cash: float = 10000.0

@app.post("/api/backtest/run")
async def run_backtest_endpoint(request: BacktestRequest):
    try:
        # Load data (offload to thread as it might be heavy IO)
        data = await asyncio.to_thread(
            data_manager.load_data_df, 
            request.symbol, 
            request.timeframe, 
            request.start_date, 
            request.end_date
        )
        if data is None or data.empty:
            raise HTTPException(status_code=404, detail="Data not found for backtest")
        
        # Select strategy
        # Check if it's a standard strategy
        strategy_class = STRATEGIES.get(request.strategy)
        params = request.params
        
        # If not standard, check if it's a saved builder strategy
        if not strategy_class:
            saved_config = strategy_manager.load_strategy(request.strategy)
            if saved_config:
                strategy_class = BuilderStrategy
                # Merge request params with saved config (request params might override?)
                # For builder, the saved config IS the params.
                params = saved_config
                # Ensure symbol is passed if needed
                params['symbol'] = request.symbol
            else:
                raise HTTPException(status_code=400, detail=f"Unknown strategy: {request.strategy}")
        
        # Run backtest (CPU intensive, offload to thread)
        def _run_engine():
            engine = BacktestEngine(data, strategy_class, request.initial_cash, params)
            return engine.run()

        results = await asyncio.to_thread(_run_engine)
        
        return results
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = f"Backtest error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg) # Print to server log
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/backtest/strategies")
def list_strategies():
    # Standard strategies
    standard = [
        {
            "name": name,
            "params": cls.get_params_schema(),
            "type": "standard"
        }
        for name, cls in STRATEGIES.items()
    ]
    
    # Saved strategies
    saved_names = strategy_manager.list_strategies()
    saved = [
        {
            "name": name,
            "params": [], # Builder strategies don't have fixed schema, they have internal config
            "type": "builder"
        }
        for name in saved_names
    ]
    
    return standard + saved

# Strategy Management API
class StrategyConfig(BaseModel):
    name: str
    config: dict

@app.get("/api/strategies/{name}")
def get_strategy(name: str):
    config = strategy_manager.load_strategy(name)
    if not config:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return config

@app.post("/api/strategies")
def save_strategy(strategy: StrategyConfig):
    success = strategy_manager.save_strategy(strategy.name, strategy.config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save strategy")
    return {"status": "success", "name": strategy.name}

@app.delete("/api/strategies/{name}")
def delete_strategy(name: str):
    success = strategy_manager.delete_strategy(name)
    if not success:
        raise HTTPException(status_code=404, detail="Strategy not found or failed to delete")
    return {"status": "success"}


mt5_client = MT5Client()
auto_close_manager = AutoCloseManager(mt5_client)

@app.on_event("startup")
async def on_startup():
    await init_db()
    # Connect in thread to avoid blocking startup
    connected = await asyncio.to_thread(mt5_client.connect)
    if connected:
        print("Connected to MT5")
    else:
        print("Failed to connect to MT5")
    
    # Re-enable background tasks
    asyncio.create_task(broadcast_prices())
    asyncio.create_task(broadcast_account_info())
    asyncio.create_task(run_auto_close_loop())

@app.on_event("shutdown")
async def on_shutdown():
    await asyncio.to_thread(mt5_client.disconnect)

async def broadcast_prices():
    while True:
        if price_manager.active_connections:
            # Fetch real rates from MT5 (offload to thread)
            symbols = ["BTCUSD", "USDJPY", "EURUSD", "XAUUSD"]
            
            def _fetch_prices():
                price_data = {}
                for symbol in symbols:
                    rate = mt5_client.get_rates(symbol)
                    if rate:
                        price_data[symbol] = rate
                return price_data

            price_data = await asyncio.to_thread(_fetch_prices)
            
            if price_data:
                await price_manager.broadcast(json.dumps(price_data))
        
        await asyncio.sleep(1)



@app.get("/api/status")
async def get_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BotStatus).order_by(BotStatus.last_updated.desc()).limit(1))
    status = result.scalars().first()
    if status:
        return {"is_running": status.is_running, "message": status.message, "last_updated": status.last_updated}
    return {"is_running": False, "message": "No status data", "last_updated": None}

@app.get("/api/positions")
async def get_positions():
    # Get real-time positions from MT5 (offload to thread)
    positions = await asyncio.to_thread(mt5_client.get_positions)
    return positions

class AccountSwitchRequest(BaseModel):
    account_name: str

@app.get("/api/accounts")
async def get_accounts():
    from bot.config import get_available_accounts, load_account_config
    
    def _get_accounts_info():
        # Get all account names
        account_names = get_available_accounts()
        
        # Load details for each account
        accounts_details = []
        for acc_name in account_names:
            try:
                config = load_account_config(acc_name)
                accounts_details.append({
                    "name": acc_name,
                    "account_number": config.get("AccountNumber"),
                    "server": config.get("Server")
                })
            except Exception:
                # If loading fails, just include name
                accounts_details.append({
                    "name": acc_name,
                    "account_number": None,
                    "server": None
                })
        return accounts_details

    accounts_details = await asyncio.to_thread(_get_accounts_info)
    
    return {
        "accounts": accounts_details,
        "current_account": mt5_client.current_account_name,
        "connected": mt5_client.connected
    }

@app.post("/api/accounts/switch")
async def switch_account(request: AccountSwitchRequest):
    success = await asyncio.to_thread(mt5_client.switch_account, request.account_name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to switch account")
    return {"message": f"Switched to {request.account_name}", "connected": True}

from datetime import datetime, timedelta

@app.get("/api/history")
async def get_history(days: int = 30, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get trading history for the last N days or specific date range.
    """
    if start_date and end_date:
        try:
            from_date = datetime.strptime(start_date, "%Y-%m-%d")
            to_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
            to_date = to_date_obj + timedelta(days=1)
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        to_date = datetime.now() + timedelta(days=1)
        from_date = to_date - timedelta(days=days + 1)
    
    positions = await asyncio.to_thread(mt5_client.get_history_positions, from_date, to_date)
    return positions

@app.websocket("/ws/prices")
async def websocket_endpoint(websocket: WebSocket):
    await price_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now, or broadcast if needed
            # In a real scenario, this would broadcast price updates from a background task or external source
            await price_manager.broadcast(f"Price update: {data}")
    except WebSocketDisconnect:
        price_manager.disconnect(websocket)

@app.websocket("/ws/account")
async def websocket_account_endpoint(websocket: WebSocket):
    await account_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        account_manager.disconnect(websocket)

async def broadcast_account_info():
    while True:
        if account_manager.active_connections:
            info = await asyncio.to_thread(mt5_client.get_account_info)
            if info:
                await account_manager.broadcast(json.dumps(info))
        
        await asyncio.sleep(1)

async def run_auto_close_loop():
    while True:
        try:
            # auto_close_manager.check_and_close() calls mt5_client methods internally
            # We should wrap the whole check logic
            await asyncio.to_thread(auto_close_manager.check_and_close)
        except Exception as e:
            print(f"Error in auto close loop: {e}")
        await asyncio.sleep(1)  # 1秒ごとにチェック

@app.get("/api/autoclose/settings", response_model=AutoCloseSettings)
async def get_auto_close_settings():
    return auto_close_manager.get_settings()

@app.post("/api/autoclose/settings", response_model=AutoCloseSettings)
async def update_auto_close_settings(settings: AutoCloseSettings):
    auto_close_manager.update_settings(settings)
    return settings


# Data Manager API
from app.data_manager import DataManager

data_manager = DataManager(mt5_client)

class DataDownloadRequest(BaseModel):
    symbol: str
    timeframe: str
    start_date: str
    end_date: str

@app.post("/api/data/download")
async def download_data(request: DataDownloadRequest):
    try:
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        # Include the end date fully
        end = end + timedelta(days=1)
        
        success = await asyncio.to_thread(data_manager.download_data, request.symbol, request.timeframe, start, end)
        if not success:
             raise HTTPException(status_code=400, detail="Failed to download data")
        return {"status": "success", "message": f"Downloaded {request.symbol} {request.timeframe}"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

@app.get("/api/data/list")
def list_data():
    # This is file system op, fast enough usually, but could be threaded if many files
    return data_manager.get_available_data()

@app.get("/api/data/load")
async def load_data(symbol: str, timeframe: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    data = await asyncio.to_thread(data_manager.load_data, symbol, timeframe, start_date, end_date)
    if data is None:
        raise HTTPException(status_code=404, detail="Data not found")
    return data


# Analysis API
from app.analysis import calculate_indicators

class IndicatorParam(BaseModel):
    name: str
    params: dict = {}

class AnalysisRequest(BaseModel):
    symbol: str
    timeframe: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    indicators: List[IndicatorParam]

@app.post("/api/analysis/indicators")
async def get_indicators(request: AnalysisRequest):
    # Load data
    data = await asyncio.to_thread(data_manager.load_data, request.symbol, request.timeframe, request.start_date, request.end_date)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found for analysis")
        
    # Calculate indicators
    try:
        results = await asyncio.to_thread(calculate_indicators, data, [ind.dict() for ind in request.indicators])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


from app.analysis import calculate_account_stats

@app.get("/api/analysis/account")
async def get_account_analysis(days: int = 30, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get account analysis statistics.
    """
    if start_date and end_date:
        try:
            from_date = datetime.strptime(start_date, "%Y-%m-%d")
            to_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
            to_date = to_date_obj + timedelta(days=1)
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        to_date = datetime.now() + timedelta(days=1)
        from_date = to_date - timedelta(days=days + 1)
    
    # Get positions (offload)
    positions = await asyncio.to_thread(mt5_client.get_history_positions, from_date, to_date)
    
    # Calculate stats (CPU bound, offload)
    stats = await asyncio.to_thread(calculate_account_stats, positions)
    return stats


# Sandbox API
from app.sandbox import run_sandbox_backtest

class SandboxCondition(BaseModel):
    indicator: str
    operator: str
    value: float
    action: str

class SandboxRequest(BaseModel):
    symbol: str
    timeframe: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    conditions: List[SandboxCondition]
    tp: float = 20.0
    sl: float = 20.0

@app.post("/api/sandbox/run")
async def run_sandbox(request: SandboxRequest):
    # Load data
    data = await asyncio.to_thread(data_manager.load_data, request.symbol, request.timeframe, request.start_date, request.end_date)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found for simulation")
        
    # Run simulation
    try:
        results = await asyncio.to_thread(
            run_sandbox_backtest,
            data, 
            [c.dict() for c in request.conditions],
            tp_pips=request.tp,
            sl_pips=request.sl
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")



import sys

# Mount static files
# Note: In production/exe, we need to handle paths correctly.
if getattr(sys, 'frozen', False):
    # Running as compiled exe
    base_path = sys._MEIPASS
    frontend_dist = os.path.join(base_path, "frontend", "dist")
else:
    # Running as script
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Allow API routes to pass through
    if full_path.startswith("api") or full_path.startswith("ws"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    if os.path.exists(frontend_dist):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
    return {"message": "Frontend not found"}
