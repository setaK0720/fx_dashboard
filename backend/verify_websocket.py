import asyncio
import websockets
import json

async def listen():
    uri = "ws://localhost:8000/ws/prices"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        try:
            while True:
                message = await websocket.recv()
                print(f"Received: {message}")
                data = json.loads(message)
                if "BTCUSD" in data:
                    btc_data = data["BTCUSD"]
                    print(f"BTCUSD Data: {btc_data}")
                    if "bid" in btc_data and "ask" in btc_data and "spread" in btc_data:
                        print("BTCUSD data has bid, ask, and spread!")
                        break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(listen())
