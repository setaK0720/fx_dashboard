import MetaTrader5 as mt5
import json
import os

ACCOUNT_INFO_PATH = r"D:\FX\forex_mytools\AccountInfo.json"
TARGET_ACCOUNT = "XM_Micro_BariBali"

def load_account_info():
    if not os.path.exists(ACCOUNT_INFO_PATH):
        print(f"Error: Account info file not found at {ACCOUNT_INFO_PATH}")
        return None
    
    with open(ACCOUNT_INFO_PATH, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    return data.get(TARGET_ACCOUNT)

def test_connection():
    account_info = load_account_info()
    if not account_info:
        print(f"Error: Account {TARGET_ACCOUNT} not found in {ACCOUNT_INFO_PATH}")
        return

    account = account_info["AccountNumber"]
    password = account_info["Password"]
    server = account_info["Server"]
    path = account_info["MT5Path"]

    print(f"Initializing MT5 with path: {path}")
    if not mt5.initialize(path=path):
        print("initialize() failed, error code =", mt5.last_error())
        return

    print(f"Logging in to account: {account}")
    authorized = mt5.login(account, password=password, server=server)
    
    if authorized:
        print(f"Connected to {account} on {server}")
        print("Account info:", mt5.account_info())
        print("Terminal info:", mt5.terminal_info())
    else:
        print("failed to connect at account #{}, error code: {}".format(account, mt5.last_error()))

    mt5.shutdown()

if __name__ == "__main__":
    test_connection()
