# バックテスト＆分析機能 実装計画

## 概要
既存のFXダッシュボードアプリを拡張し、MT5から取得したデータを用いたバックテスト機能と、取引履歴の高度な分析機能を追加する。

## アーキテクチャ

### Backend (Python/FastAPI)
- **Data Manager**: MT5からヒストリカルデータ（M1, H1など）を取得し、ローカル（CSV/Parquet）にキャッシュする。
- **Backtest Engine**:
    - イベント駆動型またはベクトル型のバックテストロジック。
    - ユーザー定義のストラテジー（Pythonクラス）を動的にロードまたは定義済みストラテジーを選択。
- **Analysis Module**:
    - `pandas` を使用して、バックテスト結果および実弾トレード履歴（`MT5Client`経由）の統計分析を行う。
    - 指標: Total Profit, Profit Factor, Win Rate, Max Drawdown, Sharpe Ratio, etc.

### Frontend (React)
- **Data View**: ヒストリカルデータの管理（ダウンロード、期間確認）。
- **Backtest View**:
    - 設定: 通貨ペア、期間、初期証拠金、ストラテジー選択、パラメータ設定。
    - 実行: 進行状況プログレスバー。
    - 結果: 資産推移グラフ（Recharts/Chart.js）、統計テーブル、取引履歴リスト。
- **Analysis View**:
    - 既存の「Order History」を拡張、または独立したタブとして実装。
    - 累積損益グラフ、月別/曜日別損益ヒートマップなど。

## データベース / ストレージ
- **ヒストリカルデータ**: ファイルシステム（`backend/data/historical/`）にCSVまたはParquet形式で保存。
- **バックテスト結果**: 一時的にはメモリ/レスポンスのみ。必要に応じてJSON保存。

## 開発ステップ

### 1. データ取得・保存 (Data Infrastructure)
- `MT5Client` に `get_candles(symbol, timeframe, start, end)` を追加。
- データ保存用のユーティリティ作成。

### 2. 市場分析・ロジック検討 (Market Analysis & Logic Research)
- **チャート機能**:
    - `Lightweight Charts` を導入し、ローソク足、出来高を表示。
    - オーバーレイ（SMA, Bollinger Bands）とオシレーター（RSI, MACD）の表示切替。
- **簡易ロジック検証**:
    - UI上で「インジケーターAがBを上抜け」などの条件を選択。
    - 該当するポイントをチャート上にマークし、その後の価格変動（N足後の損益）の分布を表示。
    - これにより、本格的なバックテストコードを書く前に「優位性がありそうなパターン」を探せるようにする。

### 3. 分析モジュール (Analysis)
- **口座履歴分析機能**:
    - `backend/app/analysis.py` に `calculate_account_stats` を追加。
    - 既存の `MT5Client.get_history_orders` (または `get_history_positions`) のデータを利用。
    - **計算項目**:
        - Total Profit, Win Rate, Profit Factor (PF)
        - Max Drawdown (DD)
        - Equity Curve (資産推移)
        - Monthly/Daily PnL (月次/日次損益)
    - **API**: `GET /api/analysis/account`

### 4. バックテストエンジン (Backtest Engine)
- **Strategy Base Class**:
    - `backend/app/backtest/strategy.py`: `Strategy` 基底クラスを定義。
    - メソッド: `init()`, `next()`, `buy()`, `sell()`, `close()`.
- **Backtest Engine**:
    - `backend/app/backtest/engine.py`: `BacktestEngine` クラス。
    - 機能:
        - ヒストリカルデータの読み込み。
        - ループ処理（バーごと）。
        - 注文管理（成行、指値、逆指値）。
        - ポジション管理と損益計算。
- **Sample Strategy**:
    - `backend/app/backtest/strategies/sma_cross.py`: サンプルとしてSMAクロス戦略を実装。
- **API**:
    - `POST /api/backtest/run`: バックテスト実行エンドポイント。
    - Request: `symbol`, `timeframe`, `strategy_name`, `params`, `start_date`, `end_date`.
    - Response: 統計結果 + 取引リスト + 資産推移。

### 5. バックテストUI (Backtest UI)
- **Backtest Panel**:
    - `frontend/src/features/backtest/BacktestPanel.tsx` を作成。
    - **Configuration**: ストラテジー選択、パラメータ入力フォーム（動的生成）。
    - **Execution**: 実行ボタンと進捗表示（Spinner）。
    - **Results**:
        - 資産推移チャート。
        - 統計カード。
        - 取引履歴テーブル。

## パフォーマンスと安定性への配慮 (Performance & Stability)
既存のトレード機能への影響を最小限にするため、以下の対策を行う。
- **非同期処理**: バックテストや重いデータ分析はバックグラウンドタスク（`BackgroundTasks` または別プロセス）として実行し、APIのレスポンスをブロックしない。
- **コード分割 (Code Splitting)**: フロントエンドでは `React.lazy` を使用し、分析・バックテスト画面のコンポーネントは必要な時だけ読み込むようにする。これにより初期ロード時間の増加を防ぐ。
- **データ管理**: 膨大なヒストリカルデータはメモリに常駐させず、必要な期間・足のみをファイル/DBから読み込む。

## ユーザー確認事項
- バックテストのストラテジーはPythonコードで記述するか、UIでパラメータ設定のみにするか？（まずはパラメータ設定のみの定型ストラテジーから開始を推奨）
- ヒストリカルデータの容量（Tickデータは巨大になるため、まずはM1足などを推奨）。
