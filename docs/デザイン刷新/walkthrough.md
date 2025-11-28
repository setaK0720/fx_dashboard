# デザイン刷新 (Glass & Violet)

ユーザーが選択した「Glass & Violet」デザインを適用しました。

## 変更点
- **テーマ**: Deep Violet & Black Gradient, Glassmorphism
- **レイアウト**: 高密度化 (Gap縮小, Padding縮小)
- **コンポーネント**:
    - **RatePanel**: グラスモーフィズム背景、ネオンボーダー
    - **ChartWidget**: 透明背景、シアンのライン、カスタムツールチップ
    - **OrderForm**: コンパクトな入力フォーム、バイオレットのアクセント
    - **AccountInfoWidget**: 1行表示（高解像度時）、ステータスバッジ
    - **PositionTable**: シンプルなライン表示、ホバーエフェクト
    - **BacktestPanel**: デザイン統一

## スクリーンショット
![New Design View](C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/new_design_view_1763944217386.png)

## 検証結果
- [x] 全体的な見た目: 意図した「シックで未来的」なデザインになっていることを確認。
- [x] レスポンシブ: モバイル表示でも崩れないことを確認（コードベース）。
- [x] 注文機能: XM_DEMO口座での成行注文（Buy/Sell）が正常に機能することを確認。
    - Debug Script: Success
    - UI Test: Success
    - ポジション一覧への反映を確認。

![Order Verification Result](C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/order_verification_result_1763945334917.png)

- [x] 外部アクセス: ローカルIP (`http://192.168.1.104:5173`) でのアクセスを確認。
![External Access Check](C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/external_access_check_1763980037366.png)

- [x] モバイルメニュー: ハンバーガーメニューとDrawerの動作を確認。
![Mobile Menu Open](C:/Users/ryhor/.gemini/antigravity/brain/2ca696e3-aed6-49f3-a72b-9f44129d74cb/mobile_menu_open_1763982823270.png)

- [x] 一括決済: APIエンドポイント (`DELETE /api/positions`) の動作を確認。
