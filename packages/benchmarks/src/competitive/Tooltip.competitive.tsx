import { describe } from 'vitest';
import { Tooltip as OvTooltip } from '@omniviewdev/base-ui';
import MuiTooltip from '@mui/material/Tooltip';
import { benchCompare } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('Tooltip competitive', () => {
  // Measures overhead of tooltip machinery even when closed.
  // Raw baseline is just the trigger element — no tooltip logic.
  benchCompare('mount (closed)', {
    'raw': () => wrapRaw(<span>Hover me</span>),
    '@omniviewdev/base-ui': () => wrapOv(
      <OvTooltip.Root>
        <OvTooltip.Trigger>Hover me</OvTooltip.Trigger>
        <OvTooltip.Portal>
          <OvTooltip.Positioner>
            <OvTooltip.Popup>Tooltip text</OvTooltip.Popup>
          </OvTooltip.Positioner>
        </OvTooltip.Portal>
      </OvTooltip.Root>,
    ),
    '@mui/material': () => wrapMui(
      <MuiTooltip title="Tooltip text">
        <span>Hover me</span>
      </MuiTooltip>,
    ),
  });
});
