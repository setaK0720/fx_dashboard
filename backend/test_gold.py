from bot.mt5_client import MT5Client

client = MT5Client()
client.connect()

print("Testing GOLD conversion:")
print(f"Server: {client.server}")
print(f"XAUUSD normalized to: {client.normalize_symbol('XAUUSD')}")

rates = client.get_rates('XAUUSD')
print(f"Rates: {rates}")
