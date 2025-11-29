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
