# 注文機能・API接続修正 ウォークスルー

## 概要
注文機能が動作しない、およびAccountメニューが表示されないという問題を解決しました。主な原因はフロントエンドとバックエンド間の通信設定（CORS/プロキシ）と、APIパスの指定方法にありました。

## 実施した変更

### 1. Viteプロキシ設定の追加
フロントエンド開発サーバー (`vite`) にプロキシ設定を追加し、`/api` および `/ws` へのリクエストをバックエンド (`localhost:8000`) に転送するようにしました。

```typescript
// frontend/vite.config.ts
server: {
  host: true,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://127.0.0.1:8000',
      ws: true,
    }
  }
}
```

### 2. APIパスの相対パス化
絶対URL (`http://localhost:8000/...`) を使用していた箇所を、プロキシ経由の相対パス (`/api/...`) に変更しました。これにより、環境依存の問題やCORSエラーを回避できます。

- `frontend/src/lib/api.ts`
- `frontend/src/features/account/AccountPanel.tsx`
- `frontend/src/hooks/usePrices.ts` (WebSocket)
- `frontend/src/hooks/useAccountInfo.ts` (WebSocket)

### 3. エラーハンドリングの改善
注文失敗時に、バックエンドから返される具体的なエラーメッセージ（例: "Market closed", "Invalid volume"）をフロントエンドで表示するように修正しました。

```typescript
// frontend/src/lib/api.ts
if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to place order' }));
    throw new Error(errorData.detail || 'Failed to place order');
}
```

## 検証結果
- **Accountメニュー**: 口座一覧が正しく取得・表示されることを確認。
- **注文機能**: BTCUSDなどの通貨ペアで注文が正常に送信され、成功することを確認（ユーザー確認済み）。
- **リアルタイム更新**: 価格と口座情報のWebSocket接続が確立されていることを確認。
