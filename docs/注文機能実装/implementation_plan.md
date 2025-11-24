# 注文機能の実装

ユーザーは、ダッシュボードから実際にMT5を通じて注文を行いたいと考えています。現在はシミュレーションロジックが動いているため、これを実実行ロジックに置き換えます。

## ユーザーレビューが必要な事項
- 現状のUIには指値・逆指値（SL/TP）の入力欄がありませんが、成行注文のみの実装で良いか。（今回は成行のみと仮定して進めます）

## 変更案

### Backend

#### [MODIFY] [mt5_client.py](file:///d:/FX/fx_dashboard/backend/bot/mt5_client.py)
- `place_order` メソッドを追加します。
    - 引数: `symbol`, `order_type` (BUY/SELL), `volume`, `sl` (optional), `tp` (optional)
    - 処理:
        1. シンボル名の正規化 (XAUUSD -> GOLD 等)
        2. `mt5.order_send` 用のリクエスト作成
        3. 注文実行と結果確認
        4. 結果（成功/失敗、注文ID、価格等）を返す

#### [MODIFY] [main.py](file:///d:/FX/fx_dashboard/backend/app/main.py)
- `place_order` エンドポイント (`/api/orders`) を修正します。
    - シミュレーションロジックを削除
    - `mt5_client.place_order` を呼び出す
    - 注文結果に基づいてレスポンスを返す
    - データベースへの保存は、`Position` テーブルが `get_positions` でMT5から直接取得されるようになったため、不要となる可能性がありますが、履歴として残す必要がある場合は別途検討。今回は「現在保有中のポジション」の表示が主目的であるため、注文成功時は単に成功レスポンスを返し、ポジション更新はWebSocketまたはポーリングに任せます。

### Frontend

#### [MODIFY] [OrderForm.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/OrderForm.tsx)
- 現状のままで機能するはずですが、エラーハンドリングや成功時のメッセージを実動作に合わせて調整する可能性があります。
- 注文成功時にポジション一覧を即座に更新するためのトリガーが必要かもしれません（現在はWebSocketで定期更新されるはずなので、少し待てば反映されます）。

## 検証計画

### 手動検証
1. XM_DEMO口座に接続されていることを確認。
2. ダッシュボードから成行注文（Buy/Sell）を実行。
3. MT5ターミナル側で注文が通ったか確認。
4. ダッシュボードのポジション一覧に新しいポジションが表示されるか確認。
