# デザイン刷新実装計画 (Glass & Violet)

ユーザーが選択した「Glass & Violet」デザイン（Option 3）を適用します。

## デザインコンセプト
- **テーマ**: Deep Violet & Black Gradient, Glassmorphism
- **特徴**: 高密度、高透明度、未来的、エレガント
- **配色**:
    - 背景: 黒 (#000000) から 深い紫 (#1a0b2e) へのグラデーション
    - パネル: 半透明の黒/紫 + ぼかし効果 (Backdrop filter)
    - テキスト: 白 (高コントラスト)、薄いグレー (副次情報)
    - アクセント: ネオンバイオレット、シアン（控えめに）
- **レイアウト**:
    - 隙間 (Gap) を狭く (4px - 8px)
    - フォントサイズを小さく (12px - 14px主体)
    - ボーダーを細く、半透明に

## 変更対象ファイル

### Global Styles / Theme
#### [MODIFY] [theme.ts](file:///d:/FX/fx_dashboard/frontend/src/theme.ts) (新規作成またはApp.tsx内で定義)
- Chakra UIのテーマをカスタマイズ
- カラーパレットの定義
- コンポーネントのデフォルトスタイル上書き (Button, Card, Menu, Input, etc.)

### Components
#### [MODIFY] [App.tsx](file:///d:/FX/fx_dashboard/frontend/src/App.tsx)
- 全体の背景色/グラデーション設定
- レイアウトコンテナのSpacing調整

#### [MODIFY] [RatePanel.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/RatePanel.tsx)
- グラスモーフィズム適用
- ドロップダウンのスタイル変更
- 文字サイズ縮小

#### [MODIFY] [ChartWidget.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/ChartWidget.tsx)
- チャート背景の透明化
- グリッド線、軸ラベルの色調整

#### [MODIFY] [OrderForm.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/OrderForm.tsx)
- 入力フォーム、ボタンのスタイル刷新
- コンパクト化

#### [MODIFY] [AccountInfoWidget.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/AccountInfoWidget.tsx)
- Statコンポーネントのスタイル調整
- グリッドレイアウトの密度向上

#### [MODIFY] [PositionTable.tsx](file:///d:/FX/fx_dashboard/frontend/src/features/dashboard/PositionTable.tsx)
- テーブルの行間短縮
- ヘッダー・セルのスタイル変更

## 手順
1. `theme.ts` を作成し、基本カラーとスタイルを定義。
2. `App.tsx` にテーマを適用し、背景を設定。
3. 各コンポーネントを順次「Glass & Violet」スタイルに変更。
4. 全体のバランス調整。
