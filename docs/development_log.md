# 開発ログ

## 2025-11-25 アカウント一覧表示のデバッグ

### 問題
「アカウント」ビューに切り替えると、アプリケーションが空白のページ（真っ白）になる問題が発生しました。

### 調査内容
- **条件付きレンダリングの失敗**: `currentView === 'dashboard'` の `else` ブロック内で React コンポーネント（インポートまたはインライン定義）をレンダリングしようとすると、クラッシュが発生しました。
- **コンポーネントの分離**: `AccountPanel` を `null` や単純な `Box` に簡略化しても、クラッシュは解消しませんでした。
- **代替アプローチの試行**:
    - **ダイアログ/モーダル**: Chakra UI の `Dialog` を使用しましたが、同様に空白ページになりました。
    - **CSSオーバーレイ**: 純粋な CSS/HTML によるオーバーレイ（絶対配置）を試みましたが、`currentView` が 'account' になるとクラッシュしました。
- **サイドバー/ヘッダー**: `Sidebar` と `Header` コンポーネントを確認しましたが、これらは正常に機能しているようでした。

### 解決策
- **復旧**: アプリケーションの安定性を確保するため、`App.tsx` を既知の動作する状態に戻しました。現在、アカウントビューにはシンプルなテキストプレースホルダーが表示されます。
- **安定性確認**: ダッシュボードビューが完全に機能し、アプリケーションがクラッシュしなくなったことを確認しました。
- **今後の対応**: アプリの安定性を維持するため、アカウント管理機能は一時的に無効化（メンテナンスメッセージを表示）しています。ビュー切り替え時のレンダリングクラッシュの根本原因を特定するために、さらなる調査が必要です。
- **バックグラウンド処理の復旧**: 価格配信や口座情報の自動更新が停止しているため、これをスレッドセーフな方法（例: 専用のロック機構、または別プロセス化）で再実装する必要がある。これは「フェーズ6」の追加タスクとして扱う。

## 2025-11-29: バックテスト実行エラー(500)の解消

### 問題
「Run Backtest」を実行すると `500 Internal Server Error` が発生する。

### 原因
1.  **データ型**: `BacktestEngine` 内で `numpy` の数値型（`int64`, `float64`）や `pandas` の `Timestamp` がそのまま残っており、FastAPI が JSON レスポンスに変換できずにエラーになっていた。
2.  **インスタンス化の誤り**: `main.py` で `BacktestEngine` にストラテジーを渡す際、クラスそのものではなく、誤ってインスタンス化したオブジェクトを渡していたため、エンジン内で再インスタンス化しようとして `TypeError` が発生していた。

### 対応
1.  `BacktestEngine` (`engine.py`) で、結果を返す前に `float()`, `int()`, `.isoformat()` を使って明示的に Python 標準型に変換するように修正。
2.  `main.py` で `BacktestEngine` の初期化引数を修正し、`strategy_class` を渡すように変更。

### 結果
バックテストが正常に完了し、トレード結果（Total Trades, Profitなど）がフロントエンドに返されるようになった。
ただし、現在 **「Equity Curveのグラフが表示されない」** という新たな表示上の問題が発生しており、引き続き調査中。

## 2025-11-29: バックテストグラフ非表示の修正

### 問題
バックテスト完了後、Equity Curveのグラフが表示されない。

### 原因
`lightweight-charts` ライブラリはデータ形式として `{ time, value }` を期待しているが、バックエンドからは `{ time, equity, balance }` という形式で返されていたため、データがチャートに反映されていなかった。

### 対応
フロントエンド (`BacktestPanel.tsx`) で、APIレスポンスを受け取った後にデータを変換する処理を追加。
- `equity` プロパティを `value` にマッピング。
- `time` (ISO文字列) を Unix Timestamp (秒) に変換。

### 結果
グラフが正常に描画されることを確認。ユーザーからも「出ました～！」との報告あり。
これでバックテスト機能の基本動作（設定→実行→結果表示→グラフ表示）は完了。

## 2025-11-29: Account Analysis White Screen Issue

### Issue
The 'Account Analysis' panel displayed a blank white screen upon loading.

### Diagnosis
- **Console Error**: \Uncaught Error: The width(-1) and height(-1) of chart should be greater than 0.\
- **Cause**: The \lightweight-charts\ library's \createChart\ function was called before the container element (\div\) had valid dimensions (width/height > 0). This typically happens when the component is rendered but the DOM layout hasn't fully calculated the size, or if the container is hidden/collapsed initially.

### Solution
Implemented a robust initialization logic using `ResizeObserver`.
1.  **Delayed Initialization**: The chart is only created when `ResizeObserver` detects non-zero dimensions.
2.  **Try-Catch Block**: Wrapped `createChart` in a try-catch block to prevent component crash even if initialization fails.
3.  **Dynamic Resizing**: The chart automatically resizes when the container size changes.

```typescript
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            if (!chart) initChart();
            else chart.applyOptions({ width: entry.contentRect.width });
        }
    }
});
resizeObserver.observe(container);
```\

### Best Practice for Future
When using \lightweight-charts\ or any canvas-based library in React:
1.  **Always check dimensions**: Ensure the container ref is not null AND has non-zero dimensions (\clientWidth > 0\, \clientHeight > 0\) before initialization.
2.  **Use ResizeObserver**: For more robust resizing, consider using \ResizeObserver\ to detect when the container actually gets a size, rather than just \window.addEventListener('resize', ...)\.


## 2025-11-29: UI Visibility Issue (Invisible Buttons)

### Issue
The "Run Backtest" button text was invisible (white text on white background) because the default `colorPalette` styling was not rendering as expected in the current theme context.

### Solution
Explicitly defined the background and text colors for the button to ensure high contrast and visibility.

### Prevention Measure (Design Guideline)
**Rule: Explicit Button Styling**
When creating `Button` components, **DO NOT** rely solely on `colorPalette` or default theme behaviors, as they may result in poor contrast (e.g., white text on white background) depending on the parent container or theme mode.

**ALWAYS** specify explicit `bg` (background) and `color` (text) props, and include a `_hover` state for better UX.

**Example:**
```tsx
// ❌ Bad (Risk of invisible text)
<Button colorPalette="teal">Action</Button>

// ✅ Good (Guaranteed visibility)
<Button 
    bg="teal.600" 
    color="white" 
    _hover={{ bg: "teal.700" }}
>
    Action
</Button>
```

### Prevention Measure (Design Guideline)
**Rule: Explicit Table Header Styling**
When using Chakra UI `Table` components, especially in dark mode or glassmorphism designs, default header styles often result in poor contrast (e.g., light gray text on transparent/light background).

**ALWAYS** specify explicit `bg` (background) and `color` (text) props for `Table.ColumnHeader`.

**Example:**
```tsx
// ❌ Bad (Risk of invisible text)
<Table.ColumnHeader color="gray.300">Type</Table.ColumnHeader>

// ✅ Good (Guaranteed visibility)
<Table.ColumnHeader color="white" bg="gray.800">Type</Table.ColumnHeader>
```

## 2025-11-29: Dropdown Visibility Issue

### Issue
The dropdown list (`select` element) content was invisible or hard to read. This is a recurring issue where default browser styles or Chakra UI defaults conflict with the application's theme (e.g., white text on white background).

### Solution
Explicitly defined high-contrast colors for both the `select` element and its `option` children.

### Prevention Measure (Design Guideline)
**Rule: Explicit Form Element Styling**
When using native HTML form elements like `<select>` or `<input>` within Chakra UI components (especially in custom themes or dark mode):

**ALWAYS** specify explicit `bg` (background) and `color` (text) properties.
For `<select>`, also style the `<option>` elements explicitly, as they often default to system colors that may not match the theme.

**Example:**
```tsx
// ❌ Bad (Risk of invisible text/background conflict)
<select style={{ width: '100%' }}>
    <option>Option 1</option>
</select>

// ✅ Good (Guaranteed visibility)
<select
    style={{ 
        width: '100%', 
        background: '#2D3748', // Dark background
        color: 'white',        // Light text
        border: '1px solid rgba(255,255,255,0.2)'
    }}
>
    {/* Force options to be readable (often white bg/black text is safest for native dropdowns) */}
    <option style={{ color: 'black', backgroundColor: 'white' }}>
        Option 1
    </option>
</select>
```

## 2025-11-29: バックエンド並行処理（デッドロック）の解消

### 問題
バックグラウンドで価格配信（`broadcast_prices`）などのループ処理を実行していると、APIリクエスト（バックテスト実行など）がブロックされたり、タイムアウトしたりする問題が発生。
原因は、`MetaTrader5` ライブラリの関数呼び出しがブロッキング処理であり、それをメインの `asyncio` イベントループ内で直接実行していたため。

### 対応
`main.py` 内のすべての MT5 クライアント呼び出し（`mt5_client.get_rates`, `place_order`, `run_backtest` 内のデータ取得など）を `await asyncio.to_thread(...)` でラップするように修正。
これにより、ブロッキング処理が別スレッド（スレッドプール）にオフロードされ、メインのイベントループがブロックされなくなった。

### 結果
バックグラウンドタスク（価格更新）と重いAPI処理（バックテスト）が同時にスムーズに動作することを確認。
これにて「フェーズ6」までのタスクが完了。

## 2025-11-29: No-Code Strategy Builderの実装完了

### 概要
ユーザーがコードを書かずにGUI上で売買戦略を作成できる「No-Code Strategy Builder」機能を実装しました。

### 実装内容
1.  **バックエンド (`BuilderStrategy`)**:
    -   JSON設定に基づいて動的にインジケーター計算と売買判定を行う汎用ストラテジークラスを実装。
    -   `pandas_ta` をラップし、動的なパラメータ（期間など）に対応。
    -   戦略の保存・読み込み・削除を行うAPIエンドポイントを追加。

2.  **フロントエンド (`StrategyBuilder`)**:
    -   エントリー条件、エグジット条件、リスク管理（SL/TP）を設定できるUIを実装。
    -   **UI改善**: ドロップダウンやボタンがダークテーマで「ホワイトアウト」する問題を、`DarkSelect` コンポーネントの実装と明示的なスタイル指定で解決。
    -   **統合**: 作成した戦略を既存のバックテストパネルから呼び出して実行できるように統合。

### 解決した主な課題
-   **ドロップダウンの視認性**: ブラウザデフォルトのスタイルがダークテーマと競合していたため、Chakra UIの `Menu` コンポーネントを使用してカスタムドロップダウンを作成し、視認性を確保。
-   **Dialogのコンテキストエラー**: Chakra UI v3の仕様に合わせて `Dialog.Backdrop`, `Dialog.Positioner`, `Portal` を正しく配置することで解決。
-   **API構文エラー**: 編集時のミスによる重複コードを修正。

### 結果
ユーザーは直感的な操作で戦略を作成し、即座にバックテストで検証できる環境が整いました。
これにて「フェーズ7」のタスクが完了しました。

## 2025-11-29: Market Analysis 日付指定機能の追加

### 概要
Market Analysisタブにおいて、チャートに表示するデータの期間（開始日・終了日）を指定できる機能を追加しました。

### 実装内容
-   **フロントエンド (`AnalysisPanel.tsx`)**:
    -   開始日 (`Start Date`) と終了日 (`End Date`) の入力フィールドを追加。
    -   「Load」ボタンを追加し、クリック時に指定された期間でデータを再取得するように変更。
    -   `loadChartData` 関数をリファクタリングし、日付指定に対応。

### 結果

## 2025-11-29: バックテスト画面への価格チャート追加

### 概要
バックテスト結果画面に、資産曲線 (Equity Curve) に加えて、価格チャート (Price Chart) を表示する機能を追加しました。

### 実装内容
-   **フロントエンド (`BacktestPanel.tsx`)**:
    -   バックテスト完了後に価格データを取得するロジックを追加。
    -   `lightweight-charts` を使用してローソク足チャートを表示。
    -   売買ポイント（エントリー・エグジット）をチャート上に矢印マーカーで可視化。
        -   Buy Entry: 緑色の上矢印
        -   Sell Entry: 赤色の下矢印
        -   Exit: 対応する色の反対方向の矢印

### 結果
バックテストの結果を、資産の増減だけでなく、実際のチャート上の売買タイミングと照らし合わせて確認できるようになりました。

## 2025-11-30: �o�b�N�e�X�g�@�\�̏C���ƃe�[�u���X�^�C���C��

### ���
1.  **Global Error Caught**: BacktestPanel.tsx �� Tbody �Ȃǂ̃G�N�X�|�[�g��������Ȃ��G���[�������BChakra UI v3 �ւ̈ڍs�ɔ����\���̕s��v�������B
2.  **�e�[�u���̎��F��**: �g���[�h�����e�[�u���̔w�i�������A�����������ɂ����i�_�[�N�e�[�}�Ƃ̕s�����j�B
3.  **�ϐ��̃V���h�[�C���O**: loadData �֐������[�J���ƃC���|�[�g�ŋ������A�f�[�^�ǂݍ��݂Ɏ��s����\�����������B

### �Ή�
1.  **�\���̍X�V**: Table �R���|�[�l���g�� Chakra UI v3 �̍\�� (Table.Root, Table.Header, Table.Body ��) �ɏ��������B
2.  **�X�^�C���̏C��**: �e�[�u���w�b�_�[�ƃZ���̔w�i�F�����F�𖾎��I�Ɏw�肵�A�_�[�N�e�[�}�ɓK���������ibg='gray.800', color='white' ���j�B
3.  **�ϐ����̏C��**: ���[�J���� loadData �� loadInitialData �Ƀ��l�[�����A�C���|�[�g���ꂽ API �֐��Ƃ̋����������B

### ����
�o�b�N�e�X�g������Ɏ��s����A���ʂ̃`���[�g�ƃg���[�h�����e�[�u�����������\�������悤�ɂȂ����B�e�[�u���̎��F�������P���ꂽ�B

## 2025-11-30: �o�b�N�e�X�g��ʂ̃��C�A�E�g���P

### �ړI
�f�X�N�g�b�v�Ȃǂ̃��C�h�X�N���[�����ɂ����āA��ʂ̉E���ɑ傫�ȋ󔒂������Ă������߁A�X�y�[�X��L�����p�������B

### �Ή�
BacktestPanel.tsx �̃��C�A�E�g�����X�|���V�u�ȃO���b�h���C�A�E�g�ɕύX�B
- **�f�X�N�g�b�v (lg�ȏ�)**: 2�J�����\���B�����ɐݒ�p�l���i�T�C�h�o�[�j�A�E���Ɍ��ʕ\���G���A�i���C���j��z�u�B
- **���o�C�� (base)**: �]����1�J�����i�c�ς݁j�\�����ێ��B

### ����
��ʑS�̂��g���ď�񂪕\�������悤�ɂȂ�A���F���Ƒ��쐫�����サ���B���o�C���ł̎g��������ێ�����Ă���B
