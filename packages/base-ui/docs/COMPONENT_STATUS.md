# Component Status — @omniviewdev/base-ui

Tracks the implementation status of components in the package.

| Component | Status | Description |
|---|---|---|
| Calendar | Beta[^1] | Single-date and range-mode calendar grid; supports `min`/`max`, custom `isDateDisabled`, `weekStartsOn`, `locale`, and `autoFocus` |
| DateField | Beta[^1] | Sectioned guided input primitive; tabbable sections, per-section validation, arrow-key increment, paste-to-fill; supports `mode` (`date`/`time`/`datetime`), `locale`, `hourCycle`, `showSeconds`, `min`/`max`, `disabled`, `readOnly` |
| DatePicker | Beta[^1] | DateField-powered date input + calendar popover; supports `min`/`max`, `locale`, `hourCycle`, `disabled`, `readOnly` |
| DateRangePicker | Beta[^1] | Dual DateField trigger + range-selecting calendar popover; supports `min`/`max`, `locale`, `rangeSeparator`, `disabled`, `readOnly` |
| DateTimePicker | Beta[^1] | DateField-powered combined date+time input with calendar+time popover; supports `min`/`max`, `showSeconds`, `hourCycle`, `minuteStep`, `disabled`, `readOnly` |
| TimePicker | Beta[^1] | DateField-powered time input + column-selector popover; supports `showSeconds`, `hourCycle`, `minuteStep`, `disabled`, `readOnly` |

[^1]: Date and time components are feature-complete and unit-tested, but final UX verification (cross-browser behavior, locale exotica, keyboard-only flows) is still pending — treat as Beta until that sign-off lands.
