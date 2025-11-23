# 開発ログ

## 2025-11-22

### プロジェクト開始
- **作業内容**: 
    - `docs/dashboard_creation` ディレクトリの作成。
    - `task.md`, `implementation_plan.md` の作成。
- **理由**: ユーザーからの `fx_dashboard` 作成依頼に基づき、プロジェクトの計画とドキュメント基盤を整備するため。
- **結果**: ドキュメント作成完了。ユーザーレビュー待ち。

## 2025-11-23: MT5リアルタイム連携とアプリ化
- **MT5連携**:
    - `MT5Client` をバックエンドに統合し、`XM_Demo` 口座からリアルタイムレート（BTCUSD, USDJPY, EURUSD）を取得・配信するように実装。
    - フロントエンドの `RatePanel` と `BacktestPanel` をBTCUSD対応に変更。
- **アプリ化**:
    - `PyInstaller` を導入し、FastAPIバックエンドとReactフロントエンド（ビルド済み）を単一の実行ファイル（`FXDashboard.exe`）にパッケージ化。
    - `backend/run.py` を作成し、`sys._MEIPASS` を用いた静的ファイルパス解決ロジックを実装。
