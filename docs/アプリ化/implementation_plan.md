# アプリケーション実行ファイル化計画

## 目的
FX Dashboard（Backend + Frontend）を、PythonやNode.jsの環境構築が不要な、単一（または配布可能）なWindows実行ファイル（.exe）としてパッケージ化する。

## アプローチ
**「FastAPIでフロントエンドを配信し、全体をPyInstallerでまとめる」** 方式を採用します。

1.  **Frontendのビルド**:
    *   React (Vite) プロジェクトをビルドし、静的ファイル（HTML, CSS, JS）を生成する (`frontend/dist`)。
2.  **Backendでの配信**:
    *   FastAPI (`app/main.py`) を修正し、ルートパス `/` でフロントエンドの `index.html` および静的アセットを配信するように設定する。
3.  **PyInstallerによるパッケージ化**:
    *   BackendのPython環境と依存ライブラリ、そしてビルド済みのFrontendファイルをまとめて、一つの実行ファイル（またはフォルダ）を作成する。

## 手順

### 1. Frontendビルド
- `frontend` ディレクトリで `npm run build` を実行。
- 生成された `dist` フォルダを確認。

### 2. Backend修正
- `backend/app/main.py` に `StaticFiles` のマウント処理を追加。
- APIルート（`/api`）以外のリクエストを `index.html` に流す（SPA対応）。

### 3. PyInstaller設定
- `pyinstaller` をインストール。
- `spec` ファイルを作成し、`dist` フォルダや `AccountInfo.json` へのパス解決ロジックを含める。
- ビルド実行。

### 4. 動作検証
- 生成された `.exe` を実行し、ブラウザが立ち上がり（または手動でアクセスし）、アプリが動作することを確認。

## 懸念点・注意点
- **MT5のパス**: `AccountInfo.json` のパス解決が実行ファイル化によって変わる可能性があるため、相対パスや実行パスの考慮が必要。
- **起動フロー**: `.exe` を起動するとコンソール（黒い画面）とサーバーが立ち上がる形になる。ブラウザの自動起動も検討。
