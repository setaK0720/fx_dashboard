from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(Integer, unique=True, index=True)
    symbol = Column(String, index=True)
    type = Column(String)  # BUY or SELL
    volume = Column(Float)
    open_price = Column(Float)
    current_price = Column(Float)
    sl = Column(Float, nullable=True)
    tp = Column(Float, nullable=True)
    profit = Column(Float)
    open_time = Column(DateTime, default=datetime.utcnow)
    
class BotStatus(Base):
    __tablename__ = "bot_status"

    id = Column(Integer, primary_key=True, index=True)
    is_running = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow)
    message = Column(String, nullable=True)
