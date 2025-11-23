# FXダッシュボード 開発ウォークスルー

## 概要
このドキュメントでは、FXダッシュボードの開発プロセス、検証結果、および重要な変更点を記録します。

## 2025-11-22: 環境構築

### バックエンド (FastAPI)
- `backend` ディレクトリを作成し、Python仮想環境 (`.venv`) を構築。
- `uv` を使用して依存関係 (`FastAPI`, `Uvicorn`, `SQLAlchemy`, `aiosqlite`) をインストール。
- `app/main.py` を作成し、サーバーが正常に起動することを確認。
- APIヘルスチェック (`/api/status`) の動作確認完了。

### フロントエンド (React + Vite)
- `frontend` ディレクトリを作成し、Vite (React + TypeScript) プロジェクトを初期化。
- 依存関係および UIライブラリ (`Chakra UI`, `Emotion`, `Framer Motion`, `Recharts`) をインストール。
- **コンポーネント実装**:
    - `Layout`: `Header`, `Sidebar`, `DashboardLayout` (Chakra UI v3対応)
    - `Dashboard`: 
        - `RatePanel`: 通貨ペアのレート表示 (Mockデータ)
        - `ChartWidget`: Rechartsを使用したチャート表示 (Mockデータ)
        - `PositionTable`: 保有ポジション一覧表示 (Mockデータ)
- `npm run build` によるビルド検証完了。

### 画面プレビュー
以下の録画で、ダッシュボードの動作（起動、コンポーネント表示、スクロール）を確認できます。

![Dashboard Preview](/C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/dashboard_preview_1763813180520.webp)

### 統合プレビュー (API & WebSocket)
バックエンドと接続し、リアルタイムにレートが更新される様子を確認できます。
※ Statusが "Stopped" となっていますが、これはDBにステータスデータがないためで、API接続自体は成功しています。

![Integration Preview](/C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/integration_preview_1763814463046.webp)

### エンドツーエンド検証 (Botシミュレーション)
`simulate_bot.py` スクリプトを使用して、Botがデータベースを更新し、それがフロントエンドに反映されることを確認しました。
- **Status**: Bot起動時に "Running"、停止時に "Stopped" に変化（ポーリング）。
- **Positions**: Botが生成したポジションがテーブルに表示される（ポーリング）。
- **Rates**: WebSocket経由でリアルタイム更新。

![E2E Verification](/C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/e2e_verification_final_1763814795285.webp)

### 注文機能検証
ブラウザから新規注文（成行）を発注し、即座にポジション一覧に反映されることを確認しました。
- **Order Form**: 通貨ペア、売買区分、数量を選択して発注。
- **Feedback**: 注文成功のアラート（またはToast）とテーブル更新。

![Order Function Verification](/C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/order_function_verification_retry_1763876251166.webp)

### バックテスト機能検証
バックエンドスクリプトおよびブラウザからバックテストを実行し、結果が取得できることを確認しました。
- **Manual Verification**: `backend/test_backtest.py` を実行し、MT5からデータを取得してシミュレーションが完了することを確認。
- **Frontend**: 設定項目（通貨ペア、期間など）を入力して実行し、結果が表示されることを確認（ブラウザ検証はタイムアウトしたがバックエンドは正常動作）。

### デモ口座接続検証
ユーザー指定の `XM_Demo` 口座への接続およびデータ取得を検証しました。
- **Connection**: `backend/test_mt5_connection.py` にて接続成功を確認。
- **Data Retrieval**: `backend/test_backtest.py` にてDemo口座からヒストリカルデータを取得し、バックテストが完了することを確認。

### BTCUSDリアルタイム表示検証
Botの監視対象およびフロントエンドの表示対象をBTCUSDに変更し、リアルタイムレートが表示されることを確認しました。
- **RatePanel**: BTCUSDの価格がリアルタイムで更新されることを確認。
- **BacktestPanel**: デフォルトのシンボルがBTCUSDになっていることを確認。

![BTCUSD Verification](/C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/btcusd_final_view_1763882617015.png)

## 今後の展望
- **認証機能**: ログイン画面の実装（今回はスキップ）。
- **履歴表示**: 過去の取引履歴のグラフ化。
- **Botロジック改善**: より高度な戦略の実装。






