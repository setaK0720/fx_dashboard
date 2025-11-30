# バックテスト＆分析アプリ開発タスク

このドキュメントは、既存のFXダッシュボードと連携するバックテストおよび分析機能の開発タスクを管理します。

## フェーズ1: 要件定義とアーキテクチャ設計
- [x] **基本設計** <!-- id: 1 -->
    - [x] 機能要件の定義（データ取得、バックテスト、分析項目） <!-- id: 2 -->
    - [x] データ保存形式の選定（CSV, SQLite, Parquetなど） <!-- id: 3 -->
    - [x] バックエンド/フロントエンドの構成設計 <!-- id: 4 -->

## フェーズ2: データ基盤構築
- [x] **ヒストリカルデータ管理機能** <!-- id: 5 -->
    - [x] Backend: MT5から指定期間・通貨ペアの足データを取得する機能 <!-- id: 6 -->
    - [x] Backend: 取得したデータをローカルに保存・読み込みする機能 <!-- id: 7 -->
    - [x] Frontend: データ取得・管理画面の実装 <!-- id: 8 -->

## フェーズ3: 市場分析・ロジック検討機能（新規追加）
- [x] **市場分析ツール** <!-- id: 20 -->
    - [x] Frontend: 高機能チャート表示（TradingView Lightweight Charts等）とインジケーター表示 <!-- id: 21 -->
    - [x] Backend: テクニカル指標計算API（TA-Lib等利用） <!-- id: 22 -->
- [x] **簡易ロジック検証（サンドボックス）** <!-- id: 23 -->
    - [x] Frontend: ノーコードまたは簡易スクリプトでの条件設定（例: RSI < 30 でBuy） <!-- id: 24 -->
    - [x] Backend: 条件に合致するポイントの抽出と統計表示（勝率、期待値など） <!-- id: 25 -->

## フェーズ4: 分析機能（既存データ連携）
- [x] **口座履歴分析機能** <!-- id: 9 -->
    - [x] Backend: 既存の注文履歴データから詳細な統計指標（PF, 勝率, DDなど）を計算するAPI <!-- id: 10 -->
    - [x] Frontend: 分析ダッシュボード画面の実装（資産推移グラフ、月次損益など） <!-- id: 11 -->

## フェーズ6: ストラテジー機能の拡張
    - [x] Backend: Strategy Discovery API (List available strategies and their params)
- [x] **UIの動的対応**
    - [x] Frontend: Fetch available strategies from API
    - [x] Frontend: Dynamic form generation based on strategy parameters
    - [x] UI Fixes: Dropdown visibility (Dark theme styling) and Loading states
    - [x] Debugging: Fix 500 error (JSON serialization & Instance vs Class)
    - [x] Debugging: Fix Graph display (Data mapping)
    - [x] Backend: Fix background task concurrency (Deadlock resolution)

## フェーズ7: ノーコード・ストラテジービルダー（条件設定型）
- [x] **バックエンド実装**
    - [x] `BuilderStrategy` class implementation (Generic strategy engine that runs based on JSON config)
    - [x] Dynamic Indicator Calculation (Wrapper for pandas_ta to handle dynamic params)
    - [x] StrategyFileManager (Save/Load JSON strategy configs)
    - [x] API Endpoints for strategy management
- [x] **フロントエンド実装**
    - [x] StrategyBuilder UI (Condition editor: Indicator, Operator, Value)
    - [x] Rule Management (Entry Rules, Exit Rules, Risk Management)
    - [x] Save/Load functionality
- [x] **統合**
    - [x] Integrate with BacktestPanel (Load JSON strategies)
