import asyncio
import logging
from bot.mt5_client import MT5Client
from bot.strategy import Strategy
from app.database import get_db_session
from app.models.base import Position, BotStatus
from sqlalchemy import select, delete
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Trader:
    def __init__(self, symbol="USDJPY", timeframe=1): # timeframe 1 min
        self.client = MT5Client()
        self.strategy = Strategy()
        self.symbol = symbol
        self.is_running = False

    async def run(self):
        if not self.client.connect():
            logger.error("Failed to connect to MT5")
            return

        self.is_running = True
        logger.info(f"Bot started for {self.symbol}")

        while self.is_running:
            try:
                # 1. Get Rates & Update Status
                tick = self.client.get_rates(self.symbol)
                if tick:
                    await self.update_status(f"Running. {self.symbol}: {tick['bid']}")
                
                # 2. Sync Positions to DB
                positions = self.client.get_positions()
                await self.sync_positions(positions)

                # 3. Strategy Logic (Placeholder for now, need historical data for real SMA)
                # For now, just logging that we are alive
                # rates = self.client.get_historical_data(self.symbol, ...) 
                # signal = self.strategy.calculate_signal(rates)
                # if signal: ...

                await asyncio.sleep(1)
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                await asyncio.sleep(5)

    async def update_status(self, message):
        async with get_db_session() as db:
            # Update or create status
            result = await db.execute(select(BotStatus))
            status = result.scalars().first()
            if not status:
                status = BotStatus(is_running=True, message=message)
                db.add(status)
            else:
                status.is_running = True
                status.message = message
                status.last_updated = datetime.utcnow()
            await db.commit()

    async def sync_positions(self, mt5_positions):
        async with get_db_session() as db:
            # Clear existing positions (simple sync strategy)
            await db.execute(delete(Position))
            
            for pos in mt5_positions:
                db_pos = Position(
                    symbol=pos['symbol'],
                    type=pos['type'],
                    volume=pos['volume'],
                    open_price=pos['open_price'],
                    current_price=pos['current_price'],
                    profit=pos['profit']
                )
                db.add(db_pos)
            await db.commit()

    def stop(self):
        self.is_running = False
        self.client.disconnect()

if __name__ == "__main__":
    trader = Trader()
    asyncio.run(trader.run())
