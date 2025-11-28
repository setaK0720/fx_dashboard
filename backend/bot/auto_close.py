import asyncio
import logging
from typing import List, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class AutoCloseCondition(BaseModel):
    enabled: bool = False
    threshold: float = 0.0
    operator: str = "ge"  # "ge" (>=) or "le" (<=)

class AutoCloseSettings(BaseModel):
    conditions: List[AutoCloseCondition] = []

class AutoCloseManager:
    def __init__(self, mt5_client):
        self.mt5 = mt5_client
        # デフォルトで2つの空の条件を作成
        self.settings = AutoCloseSettings(conditions=[
            AutoCloseCondition(enabled=False, threshold=0.0, operator="ge"),
            AutoCloseCondition(enabled=False, threshold=0.0, operator="le")
        ])
        self.is_running = False

    def update_settings(self, settings: AutoCloseSettings):
        self.settings = settings
        logger.info(f"Auto close settings updated: {self.settings}")

    def get_settings(self) -> AutoCloseSettings:
        return self.settings

    async def check_and_close(self):
        """
        定期的に呼び出されるチェック処理
        """
        # 有効な条件がひとつもなければ何もしない
        if not any(c.enabled for c in self.settings.conditions):
            return

        # 口座情報を取得
        account_info = self.mt5.get_account_info()
        if not account_info:
            return

        current_profit = account_info.get("profit", 0.0)
        should_close = False
        triggered_condition = None

        for condition in self.settings.conditions:
            if not condition.enabled:
                continue

            if condition.operator == "ge":  # 以上 (>=)
                if current_profit >= condition.threshold:
                    should_close = True
                    triggered_condition = condition
                    break
            elif condition.operator == "le":  # 以下 (<=)
                if current_profit <= condition.threshold:
                    should_close = True
                    triggered_condition = condition
                    break

        if should_close:
            logger.info(f"Auto close triggered! Profit: {current_profit}, Condition: {triggered_condition}")
            
            # 全決済を実行
            result = self.mt5.close_all_positions()
            logger.info(f"Auto close result: {result}")

            # 安全のため、すべての条件を無効化
            for c in self.settings.conditions:
                c.enabled = False
            
            logger.info("Auto close disabled after execution")
