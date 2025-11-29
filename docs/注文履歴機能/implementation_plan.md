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

## 機能改善: フィルター・ソート

### Frontend

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **ソート機能**:
    - 各カラムヘッダーをクリック可能にします。
    - クリックごとに昇順/降順を切り替えます。
    - `useState` で `sortConfig` ({ key, direction }) を管理します。
- **フィルター機能**:
    - シンボル（通貨ペア）とタイプ（BUY/SELL）のフィルター用ドロップダウンまたは入力フィールドを追加します。
    - `useState` で `filterConfig` ({ symbol, type }) を管理します。
    - 表示するデータは `deals` を `filterConfig` と `sortConfig` で加工した結果とします。

## 機能改善: ポジション単位表示

### Backend

#### [MODIFY] [mt5_client.py](file:///d:/FX/fx_dashboard/backend/bot/mt5_client.py)
- `get_history_deals` を `get_history_positions` に変更（またはロジック変更）。
- 取得した `deals` を `position_id` でグルーピングします。
- 各グループについて以下を集計します:
    - `open_time`: 最初のEntry(IN)の時間
    - `close_time`: 最後のEntry(OUT)の時間
    - `volume`: 決済された数量
    - `open_price`: Entry(IN)の価格（加重平均など）
    - `close_price`: Entry(OUT)の価格（加重平均など）
    - `profit`: 全dealのprofit + commission + swapの合計

### Frontend

#### [MODIFY] [api.ts](file:///d:/FX/fx_dashboard/frontend/src/lib/api.ts)
- `HistoryDeal` インターフェースを `HistoryPosition` に変更（または追加）。
    - `open_time`, `close_time`, `open_price`, `close_price` などを追加。

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- テーブルのカラムを以下に変更:
    - Open Time
    - Close Time
    - Symbol
    - Type
    - Volume
    - Open Price
    - Close Price
    - Profit
- データソースを新しいAPIレスポンスに対応させます。

## 機能改善: 日付範囲指定

### Backend

#### [MODIFY] [main.py](file:///d:/FX/fx_dashboard/backend/app/main.py)
- `/api/history` の引数を変更:
    - `days` (int, optional) -> 既存互換のため残すが、以下を優先。
    - `start_date` (str, optional): YYYY-MM-DD形式
    - `end_date` (str, optional): YYYY-MM-DD形式
- ロジック:
    - `start_date`, `end_date` が指定された場合、その期間のデータを取得。
    - 指定がない場合は `days` (デフォルト30) を使用。

### Frontend

#### [MODIFY] [api.ts](file:///d:/FX/fx_dashboard/frontend/src/lib/api.ts)
- `fetchHistory` の引数を変更:
    - `params: { days?: number; startDate?: string; endDate?: string }`
- クエリパラメータの生成ロジックを更新。

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **UI追加**:
    - 開始日 (`start_date`) と 終了日 (`end_date`) を選択する `<Input type="date">` を追加。
    - 「検索」ボタンを追加（または日付変更時に自動リロード）。
- **State管理**:
    - `dateRange` ({ start: string, end: string }) を `useState` で管理。
- **データ取得**:
    - `loadHistory` で `dateRange` を `fetchHistory` に渡すように変更。

## 機能改善: 合計損益表示

### Frontend

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **ロジック**:
    - `sortedAndFilteredPositions` から `profit` の合計を計算。
- **UI**:
    - テーブルの上部（フィルターの横または下）に「Total Profit: XXX」のような表示を追加。
    - プラスなら緑、マイナスなら赤で色分け。

## 機能改善: 合計Lot数表示

### Frontend

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **ロジック**:
    - `sortedAndFilteredPositions` から `volume` の合計を計算。
- **UI**:
    - 合計損益の横に「Total Lots: XXX」のような表示を追加。
    - 色は青またはグレーなど、損益とは別の色にする。

## 機能改善: シンボルフィルターのドロップダウン化

### Frontend

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **ロジック**:
    - `positions` からユニークな `symbol` のリストを抽出（`useMemo` を使用）。
- **UI**:
    - 現在の `Input` (Filter Symbol...) を `select` 要素に変更。
    - オプションに「All Symbols」と抽出したシンボルリストを表示。
    - スタイルは既存の "Type" フィルターと同様にする。

## 機能改善: IDカラムの削除

### Frontend

#### [MODIFY] [HistoryPanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/HistoryPanel.tsx)
- **UI**:
    - `Table.ColumnHeader` の "ID" を削除。
    - `Table.Cell` の `pos.position_id` 表示部分を削除。
    - `colspan` がある場合は調整（"No history found" の行など）。
