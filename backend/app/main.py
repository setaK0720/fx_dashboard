from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import init_db, get_db
from app.models.base import BotStatus, Position
from sqlalchemy import select
from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
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
from app.schemas import OrderCreate, OrderResponse, BacktestRequest, BacktestResponse
from bot.backtester import run_backtest

@app.post("/api/orders", response_model=OrderResponse)
async def place_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    # ... (existing order logic) ...
    # Simulation logic
    order_id = str(uuid.uuid4())
    
    # Determine mock price based on symbol
    base_price = 150.00 if "JPY" in order.symbol else 1.0800
    # Add some random variation
    open_price = round(base_price + random.uniform(-0.05, 0.05), 3 if "JPY" in order.symbol else 5)
    
    # Initial spread cost (mock)
    spread = 0.003 if "JPY" in order.symbol else 0.00003
    current_price = open_price - spread if order.order_type == "BUY" else open_price + spread
    
    # Calculate initial profit (negative due to spread)
    diff = (current_price - open_price) if order.order_type == "BUY" else (open_price - current_price)
    profit = diff * order.volume * 100000
    if "JPY" in order.symbol:
        profit /= 100 # Adjust for JPY pairs (usually 100 units per pip, but simplified here)

    new_position = Position(
        symbol=order.symbol,
        type=order.order_type,
        volume=order.volume,
        open_price=open_price,
        current_price=round(current_price, 3 if "JPY" in order.symbol else 5),
        profit=round(profit, 0)
    )
    
    db.add(new_position)
    await db.commit()
    
    return OrderResponse(
        order_id=order_id,
        status="FILLED",
        message=f"Order executed: {order.order_type} {order.symbol} @ {open_price}"
    )

@app.post("/api/backtest", response_model=BacktestResponse)
async def run_backtest_endpoint(request: BacktestRequest):
    try:
        result = run_backtest(
            request.symbol,
            request.timeframe,
            request.period_days,
            request.initial_cash,
            request.short_window,
            request.long_window
        )
        return BacktestResponse(**result)
    except Exception as e:
        # In a real app, handle specific errors
        raise HTTPException(status_code=500, detail=str(e))


from bot.mt5_client import MT5Client

mt5_client = MT5Client()

@app.on_event("startup")
async def on_startup():
    await init_db()
    if mt5_client.connect():
        print("Connected to MT5")
    else:
        print("Failed to connect to MT5")
    asyncio.create_task(broadcast_prices())
    asyncio.create_task(broadcast_account_info())

@app.on_event("shutdown")
async def on_shutdown():
    mt5_client.disconnect()

async def broadcast_prices():
    while True:
        if price_manager.active_connections:
            # Fetch real rates from MT5
            symbols = ["BTCUSD", "USDJPY", "EURUSD", "XAUUSD"]
            price_data = {}
            
            for symbol in symbols:
                rate = mt5_client.get_rates(symbol)
                if rate:
                    # Send full rate data (bid, ask, spread)
                    price_data[symbol] = rate
                else:
                    # Fallback or keep previous if needed, for now just skip or use 0
                    # To avoid UI flickering, we might want to maintain last known state
                    pass
            
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
def get_positions():  # Changed from async def to def
    # Get real-time positions from MT5
    positions = mt5_client.get_positions()
    return positions

class AccountSwitchRequest(BaseModel):
    account_name: str

@app.get("/api/accounts")
def get_accounts():  # Changed from async def to def
    from bot.config import get_available_accounts, load_account_config
    
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
    
    return {
        "accounts": accounts_details,
        "current_account": mt5_client.current_account_name,
        "connected": mt5_client.connected
    }

@app.post("/api/accounts/switch")
async def switch_account(request: AccountSwitchRequest):
    success = mt5_client.switch_account(request.account_name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to switch account")
    return {"message": f"Switched to {request.account_name}", "connected": True}

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
            info = mt5_client.get_account_info()
            if info:
                await account_manager.broadcast(json.dumps(info))
        
        await asyncio.sleep(1)



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
