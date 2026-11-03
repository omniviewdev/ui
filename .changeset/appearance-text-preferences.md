---
'@omniviewdev/base-ui': minor
---

Add independent 80%, 90%, 100%, 110%, and 125% UI text sizing to ThemeProvider and useTheme. Keep root-rem layout geometry stable, correct compounded body typography, inherit provider density in CommandList, and stop decorative animations under reduced motion while retaining static progress indicators.

Keep Tooltip custom-render triggers transparent to the wrapped control's styling, including nested Menu triggers. Explicit Tooltip.Trigger overrides remain supported, while tooltip root defaults no longer change action-button size or variant.

Allow `SplitButton.Menu` to disable its dropdown independently from the primary action with the optional `disabled` prop.

Give ghost SplitButton groups a shared, rounded hover surface while keeping the idle control unboxed and each half independently focusable.
