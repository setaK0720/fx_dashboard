# 口座情報の表示機能

ユーザーは、現在の口座残高、クレジット、証拠金などの詳細情報をダッシュボード上で確認したいと考えています。

## ユーザーレビューが必要な事項
特になし。

## 変更案

### Backend

#### [MODIFY] [mt5_client.py](file:///d:/FX/fx_dashboard/backend/bot/mt5_client.py)
- `get_account_info` メソッドを追加し、`mt5.account_info()` の結果を返します。
    - 取得項目: `balance`, `equity`, `margin`, `margin_free`, `margin_level`, `profit`, `credit` など。

#### [MODIFY] [main.py](file:///d:/FX/fx_dashboard/backend/app/main.py)
- 新しいWebSocketエンドポイント `/ws/account` を追加します。
- `broadcast_account_info` バックグラウンドタスクを追加し、定期的に（例：1秒ごと）口座情報をブロードキャストします。

### Frontend

#### [NEW] [useAccountInfo.ts](file:///d:/FX/fx_dashboard/frontend/src/hooks/useAccountInfo.ts)
- `/ws/account` に接続し、リアルタイムで口座情報を受け取るカスタムフックを作成します。

#### [NEW] [AccountInfoWidget.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/AccountInfoWidget.tsx)
- 口座情報を表示するコンポーネントを作成します。
- 表示項目: 残高 (Balance), 有効証拠金 (Equity), 必要証拠金 (Margin), 余剰証拠金 (Free Margin), 証拠金維持率 (Margin Level), クレジット (Credit), 含み益 (Profit)。
- リアルタイム更新に対応。

#### [MODIFY] [App.tsx](file:///d:/FX/fx_dashboard/frontend/src/App.tsx)
- ダッシュボードレイアウトに `AccountInfoWidget` を追加します。

## 検証計画

### 自動テスト
- なし

### 手動検証
1. バックエンドサーバーを起動し、WebSocket接続が確立されるか確認。
2. フロントエンドで口座情報（特に有効証拠金と含み益）がリアルタイムに変動することを確認（ポジションを持っている場合）。
3. 口座切り替え時に情報が正しく更新されるか確認。
