import json
import os

ACCOUNT_INFO_PATH = r"D:\FX\forex_mytools\AccountInfo.json"
TARGET_ACCOUNT = "XM_Demo"

def load_account_config():
    if not os.path.exists(ACCOUNT_INFO_PATH):
        raise FileNotFoundError(f"Account info file not found at {ACCOUNT_INFO_PATH}")
    
    with open(ACCOUNT_INFO_PATH, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    config = data.get(TARGET_ACCOUNT)
    if not config:
        raise ValueError(f"Account {TARGET_ACCOUNT} not found in {ACCOUNT_INFO_PATH}")
    
    return config
