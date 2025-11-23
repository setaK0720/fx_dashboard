# レート表示機能強化計画

## 目的
ユーザーがダッシュボード上で表示する通貨ペア（シンボル）を選択できるようにし、各ペアのBid（売値）、Ask（買値）、Spread（スプレッド）をリアルタイムで表示する。

## アプローチ

### 1. Backend (FastAPI + MT5)
- **データ取得 (`MT5Client`)**:
    - `get_rates` メソッドで、Bid, Ask に加えて Spread を算出（または取得）して返すように修正。
    - Spreadは `Ask - Bid` で算出、または `symbol_info` から取得（今回はリアルタイム性を重視し、Tickデータから算出）。
- **データ配信 (`main.py`)**:
    - WebSocketで配信するデータ構造を拡張。
    - `{ "BTCUSD": { "bid": ..., "ask": ..., "spread": ... }, ... }` の形式に変更。
    - 配信対象のシンボルリストを拡張（主要通貨ペア + BTCUSD）。

### 2. Frontend (React)
- **RatePanelコンポーネント**:
    - **シンボル選択UI**: 表示したいシンボルを選択できるドロップダウン（またはチェックボックス）を追加。
    - **表示形式**: 単なる数値ではなく、Bid / Ask / Spread を表形式（またはカード形式）で表示。
    - **状態管理**: 選択されたシンボルをStateで管理（初期値はBTCUSD, USDJPYなど）。

## 実装ステップ

1.  **Backend修正**:
    - `bot/mt5_client.py`: `get_rates` の返り値拡張。
    - `app/main.py`: `broadcast_prices` のロジック変更、配信シンボル追加。

2.  **Frontend修正**:
    - `hooks/usePrices.ts`: 新しいデータ構造に対応（型定義の更新）。
    - `features/dashboard/RatePanel.tsx`:
        - シンボル選択機能の実装。
        - Bid/Ask/Spread表示用UIの実装。

## 検証
- ブラウザで複数のシンボルを選択し、それぞれの詳細レートがリアルタイム更新されることを確認。
