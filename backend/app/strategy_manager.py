import os
import json
import glob

STRATEGY_DIR = os.path.join(os.path.dirname(__file__), "backtest", "saved_strategies")

class StrategyManager:
    def __init__(self):
        if not os.path.exists(STRATEGY_DIR):
            os.makedirs(STRATEGY_DIR)

    def list_strategies(self):
        """List all saved strategy files (without extension)"""
        files = glob.glob(os.path.join(STRATEGY_DIR, "*.json"))
        return [os.path.splitext(os.path.basename(f))[0] for f in files]

    def load_strategy(self, name):
        """Load strategy config by name"""
        path = os.path.join(STRATEGY_DIR, f"{name}.json")
        if not os.path.exists(path):
            return None
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading strategy {name}: {e}")
            return None

    def save_strategy(self, name, config):
        """Save strategy config"""
        path = os.path.join(STRATEGY_DIR, f"{name}.json")
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving strategy {name}: {e}")
            return False

    def delete_strategy(self, name):
        """Delete strategy file"""
        path = os.path.join(STRATEGY_DIR, f"{name}.json")
        if os.path.exists(path):
            os.remove(path)
            return True
        return False
