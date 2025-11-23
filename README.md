# FX Dashboard

MetaTrader 5 (MT5) と連携し、自動売買およびバックテストを行うためのWebベースのダッシュボードアプリケーションです。

## 機能

- **ダッシュボード**: リアルタイムレート、保有ポジション、資産推移の可視化。
- **注文機能**: Web UIからの裁量注文（成行）。
- **MT5連携**: PythonバックエンドからMT5を制御し、レート取得や注文執行が可能。
- **バックテスト**: MT5からヒストリカルデータを取得し、戦略のシミュレーションを実行・結果表示。

## 技術スタック

- **Backend**: FastAPI (Python), SQLite, SQLAlchemy, MetaTrader5, pandas, backtesting
- **Frontend**: React, Vite, TypeScript, Chakra UI, Recharts

## 必要要件

- Windows OS (MT5が動作する環境)
- MetaTrader 5 (XM Trading等の対応ブローカー)
- Python 3.10+
- Node.js 18+

## セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/setaK0720/fx_dashboard.git
cd fx_dashboard
```

### 2. Backend (FastAPI)
```bash
cd backend
# 仮想環境の作成と有効化
python -m venv .venv
.venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
pip install MetaTrader5 pandas backtesting

# サーバー起動
uvicorn app.main:app --reload
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 4. MT5設定
`backend/bot/config.py` または `D:\FX\forex_mytools\AccountInfo.json` (非公開) にてMT5のパスと口座情報を設定してください。

## 使い方

1. バックエンドとフロントエンドの両方のサーバーを起動します。
2. ブラウザで `http://localhost:5173` にアクセスします。
3. **Dashboard**: 現在のレートとポジションを確認できます。
4. **Order**: 通貨ペアと数量を指定して注文を出せます（現在はシミュレーションモード）。
5. **Backtest**: 通貨ペアと期間を指定して「Run Backtest」をクリックすると、検証結果が表示されます。

## ライセンス
MIT
