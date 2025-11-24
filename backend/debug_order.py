import asyncio
import logging
from bot.mt5_client import MT5Client

logging.basicConfig(level=logging.INFO)

def test_order():
    client = MT5Client()
    if not client.connect():
        print("Failed to connect")
        return

    print(f"Connected to {client.account}")
    
    # Try to place an order
    symbol = "BTCUSD"
    volume = 0.01
    order_type = "BUY"
    
    print(f"Attempting to place {order_type} order for {volume} {symbol}...")
    
    result = client.place_order(symbol, order_type, volume)
    
    print("Result:", result)
    
    client.disconnect()

if __name__ == "__main__":
    test_order()
