# UIレイアウト修正: ドロップダウンのZ-Index問題

## 目標
レートパネルのドロップダウンリストを展開した際に、口座情報パネルの下に隠れてしまいクリックできない問題を修正する。

## 提案される変更
### フロントエンド
#### [MODIFY] [RatePanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/RatePanel.tsx)
- `RatePanel` のルート `Box` コンポーネントに `zIndex={10}` と `position="relative"` を追加し、`AccountInfoWidget` よりも前面に表示されるようにする。

## 検証計画
### 手動検証
- レートパネルのドロップダウンを展開し、口座情報パネルに隠れずに表示されることを確認する。
- ドロップダウン内の項目がクリック可能であることを確認する。
