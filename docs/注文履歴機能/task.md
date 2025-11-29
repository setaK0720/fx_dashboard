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

- [x] **検証** <!-- id: 11 -->
    - [x] APIの動作確認 (curl等) <!-- id: 12 -->
    - [x] フロントエンドでの表示確認 <!-- id: 13 -->

- [x] **機能改善: フィルター・ソート** <!-- id: 14 -->
    - [x] `HistoryPanel.tsx` にソート機能（項目クリック）を追加 <!-- id: 15 -->
    - [x] `HistoryPanel.tsx` にフィルター機能（シンボル、タイプ等）を追加 <!-- id: 16 -->

- [x] **機能改善: ポジション単位表示** <!-- id: 17 -->
    - [x] Backend: `get_history_deals` を改修し、ポジション単位で集計して返すように変更 <!-- id: 18 -->
    - [x] Frontend: `HistoryPanel` のカラム構成を変更（Open/Close時間、価格など） <!-- id: 19 -->

- [x] **機能改善: 日付範囲指定** <!-- id: 20 -->
    - [x] Backend: APIエンドポイント (`/api/history`) が `start_date`, `end_date` を受け取れるように変更 <!-- id: 21 -->
    - [x] Frontend: `api.ts` の `fetchHistory` を更新 <!-- id: 22 -->
    - [x] Frontend: `HistoryPanel` に日付選択UI (Date Picker) を追加 <!-- id: 23 -->

- [x] **機能改善: 合計損益表示** <!-- id: 24 -->
    - [x] Frontend: `HistoryPanel` に表示中のポジションの合計損益を表示するエリアを追加 <!-- id: 25 -->

- [x] **機能改善: 合計Lot数表示** <!-- id: 26 -->
    - [x] Frontend: `HistoryPanel` に表示中のポジションの合計Lot数を表示するエリアを追加 <!-- id: 27 -->

- [x] **機能改善: シンボルフィルターのドロップダウン化** <!-- id: 28 -->
    - [x] Frontend: `HistoryPanel` のシンボル入力欄をドロップダウンに変更し、履歴に含まれるシンボルを選択可能にする <!-- id: 29 -->

- [x] **機能改善: IDカラムの削除** <!-- id: 30 -->
    - [x] Frontend: `HistoryPanel` からIDカラムを削除する <!-- id: 31 -->
