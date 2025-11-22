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


