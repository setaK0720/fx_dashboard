# タスクリスト: 注文履歴機能の実装

- [x] **計画** <!-- id: 0 -->
    - [x] `task.md` の作成 <!-- id: 1 -->
    - [x] `implementation_plan.md` の作成 <!-- id: 2 -->

- [x] **Backend実装** <!-- id: 3 -->
    - [x] `MT5Client` に履歴取得メソッド (`get_history_deals`) を追加 <!-- id: 4 -->
    - [x] APIエンドポイント (`GET /api/history`) の実装 <!-- id: 5 -->
    - [x] レスポンスデータの型定義 <!-- id: 6 -->

- [x] **Frontend実装** <!-- id: 7 -->
    - [x] APIクライアント (`api.ts`) に履歴取得関数を追加 <!-- id: 8 -->
    - [x] `HistoryPanel` コンポーネントの作成 <!-- id: 9 -->
    - [x] `App.tsx` と `Sidebar` に画面遷移を追加 <!-- id: 10 -->

- [ ] **検証** <!-- id: 11 -->
    - [ ] APIの動作確認 (curl等) <!-- id: 12 -->
    - [ ] フロントエンドでの表示確認 <!-- id: 13 -->
