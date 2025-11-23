# 口座切り替え機能実装計画

## 目的
サイドバーに「Account」メニューを追加し、`D:\FX\forex_mytools\AccountInfo.json` に定義されたMT5口座を切り替えられるようにする。

## アプローチ

### 1. Backend (FastAPI)
- **設定読み込み (`config.py`)**:
    - `AccountInfo.json` から全ての口座名（キー）を取得する機能を追加。
- **MT5クライアント (`mt5_client.py`)**:
    - 接続先口座を動的に変更できる `switch_account(account_name)` メソッドを追加。
    - 現在接続中の口座情報を保持。
- **API (`main.py`)**:
    - `GET /api/accounts`: 利用可能な口座名のリストと、現在接続中の口座を返す。
    - `POST /api/accounts/switch`: 指定された口座に切り替える。

### 2. Frontend (React)
- **サイドバー (`Sidebar.tsx`)**:
    - 「Account」リンクを追加。
- **アカウント管理画面 (`features/account/AccountPanel.tsx`)**:
    - 利用可能な口座一覧を表示。
    - 現在接続中の口座をハイライト。
    - 「切り替え」ボタンで口座を変更（API呼び出し）。
- **ルーティング (`App.tsx`)**:
    - `/account` ルートを追加し、`AccountPanel` を表示（または既存のダッシュボード内にモーダル/パネルとして表示するか検討。今回は別画面またはメインエリアの切り替えとして実装）。
    - *補足*: シンプルにするため、ダッシュボードの下部や別タブではなく、メインコンテンツエリアを切り替える構成にするか、あるいは現在のダッシュボード構成（`DashboardLayout`）の中に組み込む。今回は `App.tsx` でルート分岐はしていないため、条件分岐で表示コンポーネントを切り替えるか、モーダルで実装するのが手軽。
    - **決定**: サイドバーの「Account」をクリックすると、メインエリアにアカウント一覧が表示されるように `App.tsx` の表示状態を管理する。

## 実装ステップ

1.  **Backend実装**:
    - `config.py`: `get_available_accounts()` 実装。
    - `mt5_client.py`: `reload_config(account_name)` 追加。
    - `main.py`: APIエンドポイント追加。

2.  **Frontend実装**:
    - `Sidebar.tsx`: メニュー追加。
    - `AccountPanel.tsx`: コンポーネント作成。
    - `App.tsx`: 画面切り替えロジック追加。

## 検証
- API経由で口座リストが取得できること。
- 画面から口座を切り替えると、バックエンドでMT5の再接続が行われ、新しい口座のレートが配信されること。
