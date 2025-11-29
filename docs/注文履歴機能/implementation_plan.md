# 注文履歴機能 実装計画

## 目標
ユーザーが過去の取引履歴（決済済みの注文）を確認できる画面を追加します。

## 実装詳細

### Backend

#### [MODIFY] [mt5_client.py](file:///d:/FX/fx_dashboard/backend/bot/mt5_client.py)
- `get_history_deals` メソッドを追加します。
    - 引数: `from_date` (datetime), `to_date` (datetime)
    - 処理: `mt5.history_deals_get` を使用して指定期間の約定履歴を取得します。
    - 戻り値: 約定データのリスト（チケット番号、シンボル、タイプ、数量、価格、損益、時間など）。

#### [MODIFY] [main.py](file:///d:/FX/fx_dashboard/backend/app/main.py)
- `GET /api/history` エンドポイントを追加します。
    - クエリパラメータ: `days` (デフォルト30日分など)
    - 処理: `mt5_client.get_history_deals` を呼び出し、整形して返します。

### Frontend

#### [MODIFY] [api.ts](file:///d:/FX/fx_dashboard/frontend/src/lib/api.ts)
- `fetchHistory` 関数を追加します。
- `HistoryDeal` インターフェースを定義します。

#### [NEW] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- 履歴を表示するテーブルコンポーネントを作成します。
- `PositionTable` と同様のデザイン（ガラスモーフィズム）を採用します。
- 表示項目: 時間、シンボル、タイプ、数量、価格、損益。

#### [MODIFY] [App.tsx](file:///d:/FX/fx_dashboard/frontend/src/App.tsx)
- ルーティング（表示切り替えロジック）に `history` を追加します。
- `HistoryPanel` を表示するように修正します。

#### [MODIFY] [Sidebar.tsx](file:///d:/FX/fx_dashboard/frontend/src/components/Layout/Sidebar.tsx)
- サイドバーメニューに「History」を追加します。

## 検証計画

### 自動テスト
- 現状、自動テスト環境が完全ではないため、手動検証を主とします。

### 手動検証
1. **API確認**:
    - `curl http://localhost:8000/api/history` を実行し、JSONデータが返ってくることを確認します。
2. **UI確認**:
    - ダッシュボードのサイドバーから「History」をクリック。
    - 履歴画面が表示されることを確認。
    - 過去の取引データ（もしあれば）が表示されていることを確認。
    - データがない場合でもエラーにならず「No history」等が表示されるか確認。
