from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import init_db, get_db
from app.models.base import BotStatus, Position
from sqlalchemy import select
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
            await connection.send_text(message)

manager = ConnectionManager()

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


@app.on_event("startup")
async def on_startup():
    await init_db()
    asyncio.create_task(broadcast_prices())

async def broadcast_prices():
    while True:
        if manager.active_connections:
            price_data = {
                "USD/JPY": round(150.00 + random.uniform(-0.5, 0.5), 3),
                "EUR/USD": round(1.0850 + random.uniform(-0.005, 0.005), 5)
            }
            await manager.broadcast(json.dumps(price_data))
        await asyncio.sleep(1)

@app.get("/")
async def root():
    return {"message": "FX Dashboard API"}


@app.get("/api/status")
async def get_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BotStatus).order_by(BotStatus.last_updated.desc()).limit(1))
    status = result.scalars().first()
    if status:
        return {"is_running": status.is_running, "message": status.message, "last_updated": status.last_updated}
    return {"is_running": False, "message": "No status data", "last_updated": None}

@app.get("/api/positions")
async def get_positions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Position))
    positions = result.scalars().all()
    return positions

@app.websocket("/ws/prices")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now, or broadcast if needed
            # In a real scenario, this would broadcast price updates from a background task or external source
            await manager.broadcast(f"Price update: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


