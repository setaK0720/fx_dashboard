import json
import os

ACCOUNT_INFO_PATH = r"D:\FX\forex_mytools\AccountInfo.json"
TARGET_ACCOUNT = "XM_Demo"

def get_available_accounts():
    if not os.path.exists(ACCOUNT_INFO_PATH):
        return []
    
    with open(ACCOUNT_INFO_PATH, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    return list(data.keys())

def load_account_config(account_name=None):
    if not os.path.exists(ACCOUNT_INFO_PATH):
        raise FileNotFoundError(f"Account info file not found at {ACCOUNT_INFO_PATH}")
    
    with open(ACCOUNT_INFO_PATH, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    target = account_name if account_name else TARGET_ACCOUNT
    config = data.get(target)
    
    if not config:
        raise ValueError(f"Account {target} not found in {ACCOUNT_INFO_PATH}")
    
    return config
