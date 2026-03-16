import { describe } from 'vitest';
import { Switch as OvSwitch } from '@omniview/base-ui';
import MuiSwitch from '@mui/material/Switch';
import { benchCompare } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('Switch competitive', () => {
  benchCompare('mount', {
    'raw': () => wrapRaw(<input type="checkbox" role="switch" aria-checked="false" />),
    '@omniview/base-ui': () => wrapOv(<OvSwitch />),
    '@mui/material': () => wrapMui(<MuiSwitch />),
  });
});
