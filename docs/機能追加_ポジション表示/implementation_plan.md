# ポジション表示機能更新計画

## 目的
ダッシュボード上に現在の保有ポジション一覧を表示し、必要な情報（取得時間、取得価格、Lot、Long/Short）を網羅する。また、サイドバーから不要になった「Positions」メニューを削除する。

## アプローチ

### 1. Backend (FastAPI + MT5)
- **データ取得 (`MT5Client`)**:
    - `get_positions` メソッドで、ポジションの「約定時間（Time）」も取得して返すように修正。
    - 返却データ構造: `id`, `symbol`, `type` (Long/Short), `volume` (Lot), `open_price`, `time`, `current_price`, `profit`.

### 2. Frontend (React)
- **PositionTableコンポーネント**:
    - 表示カラムを以下の通り変更・整理:
        - **Time**: 取得時間 (yyyy/MM/dd HH:mm:ss)
        - **Elapsed**: 経過時間 (例: 2h 15m)
        - **Symbol**: 通貨ペア
        - **Type**: Long / Short (色分け推奨)
        - **Lot**: 取引量
        - **Price**: 取得価格
        - **Profit**: 損益 (既存のまま維持)
- **Sidebarコンポーネント**:
    - 「Positions」リンクを削除。

## 実装ステップ

1.  **Backend修正**:
    - `bot/mt5_client.py`: `get_positions` に `time` フィールドを追加。

2.  **Frontend修正**:
    - `features/dashboard/PositionTable.tsx`: カラム定義の変更、日付フォーマット処理の追加。
    - `components/layout/Sidebar.tsx`: メニュー項目の削除。

## 検証
- ダッシュボード上でポジション一覧が期待通りの項目で表示されること。
- サイドバーから「Positions」が消えていること。
