# FXダッシュボード 実装計画 (FastAPI + React)

## 目標
FX取引情報とBot稼働状況をリアルタイムに管理・可視化するWebアプリケーションを開発します。
処理速度とカスタマイズ性を重視し、モダンなWeb技術スタックを採用します。

## ユーザー確認事項
> [!IMPORTANT]
> **技術スタック**:
> - **Backend**: **FastAPI** (Python) - 高速、非同期、型安全。
> - **Frontend**: **React** (Vite) - 高速なSPA開発、リッチなUI。
> - **Database**: **SQLite** (非同期ドライバ `aiosqlite` 使用)。
> - **Communication**: **WebSocket** - リアルタイム価格更新。
> - **UI Library**: **Chakra UI** (開発速度と見た目の良さを重視)。

## 提案内容

### プロジェクト構成 (`d:/FX/fx_dashboard`)
```
fx_dashboard/
├── backend/            # FastAPI Server
│   ├── app/
│   │   ├── main.py     # エントリーポイント
│   │   ├── api/        # APIエンドポイント
│   │   ├── models/     # DBモデル
│   │   └── schemas/    # Pydanticスキーマ
│   ├── requirements.txt
│   └── database.db     # SQLite DB
├── frontend/           # React App
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── hooks/      # カスタムフック (WebSocket等)
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 実装ステップ

### 1. 環境構築
- `d:/FX/fx_dashboard` の初期化。
- **Backend**: 仮想環境作成、FastAPIインストール。
- **Frontend**: `npm create vite@latest` でReactプロジェクト作成。

### 2. バックエンド実装 (FastAPI)
- データベース接続 (SQLite + SQLAlchemy/Tortoise ORM)。
- APIエンドポイント作成:
    - `GET /api/status`: Bot稼働状況
    - `GET /api/positions`: ポジション一覧
    - `WS /ws/prices`: リアルタイム価格配信
- Botからのデータ受信機能 (Webhook または DB共有)。
    - *注: BotがAPI経由でデータを送る疎結合な構成を推奨。*

### 3. フロントエンド実装 (React)
- ダッシュボード画面のレイアウト作成。
- WebSocket接続とリアルタイムチャート表示 (Recharts または Lightweight Charts)。
- ポジションテーブルと口座情報カードの実装。

## 検証計画
1.  **APIテスト**: Swagger UI (`/docs`) でAPIの動作確認。
2.  **フロントエンド表示**: `npm run dev` で画面が表示され、モックデータまたは実データが表示されること。
3.  **リアルタイム連携**: Botからデータを送信し、ダッシュボードのチャートが動くことを確認。
