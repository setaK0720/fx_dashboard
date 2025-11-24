# 開発ログ - デザイン刷新

## 2025-11-24

### 概要
ユーザーの要望に基づき、アプリケーションのデザインを「Glass & Violet」テーマに刷新し、レイアウトを高密度化しました。

### 変更内容
1.  **テーマ適用 (`theme.ts`)**:
    *   Chakra UIの `createSystem` を使用してカスタムテーマを作成。
    *   カラーパレット: Deep Violet & Black Gradient, Glassmorphism (透明度のある黒/紫)。
    *   フォントサイズ、スペーシングの調整。

2.  **コンポーネントのスタイル変更**:
    *   `App.tsx`: 全体の背景設定、レイアウトコンテナの余白削除（フル幅対応）。
    *   `DashboardLayout.tsx`: パディング削除、背景透明化。
    *   `RatePanel.tsx`, `ChartWidget.tsx`, `OrderForm.tsx`, `AccountInfoWidget.tsx`, `PositionTable.tsx`, `BacktestPanel.tsx`:
        *   背景色を `bg.panel` (半透明) に変更。
        *   ボーダーを `border.glass` (薄い紫/グレー) に変更。
        *   `backdropFilter="blur(10px)"` を適用。
        *   フォントサイズを縮小し、情報密度を向上。
    *   `AccountInfoWidget.tsx`: レイアウトを `SimpleGrid` から `Flex` に変更し、右側の余白問題を解消。

3.  **調整 (Round 2)**:
    *   カラーリングを全体的に彩度を下げ、グレー/スレート寄りに調整。
    *   画面幅をウィンドウ全体に拡大。

### 結果
*   未来的でシックなデザインを実現。
*   一画面あたりの情報量が増加。
*   レスポンシブ対応を確認。

### 次のステップ
### 2025-11-24 (追記)
*   **外部アクセス対応**:
    *   Backend: `uvicorn` のホストを `0.0.0.0` に変更し、CORS設定で全オリジン (`*`) を許可。
    *   Frontend: `vite` のホスト設定を追加し、API接続先を `window.location.hostname` を使用して動的に解決するように変更。
*   **バグ修正**:
    *   `App.tsx` のタイプミス (`PitionTable` -> `PositionTable`) を修正。
    *   `theme.ts` が欠落していた問題を修正し、Semantic Tokensを使用して再定義。
*   **モバイル対応**:
    *   モバイル表示時に左サイドバーを非表示にし、ヘッダーにハンバーガーメニューを追加。
    *   Chakra UIの `Drawer` コンポーネントを使用して、メニュー開閉機能を実装。
*   **一括決済機能**:
    *   `MT5Client` に `close_all_positions` メソッドを追加。
    *   Backendに `DELETE /api/positions` エンドポイントを追加。
    *   Frontendの `PositionTable` に「CLOSE BUY」「CLOSE SELL」「CLOSE ALL」ボタンを追加。
