import { describe } from 'vitest';
import { Button as OvButton } from '@omniviewdev/base-ui';
import MuiButton from '@mui/material/Button';
import { benchCompare, benchCompareMany } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('Button competitive', () => {
  benchCompare('mount', {
    'raw': () => wrapRaw(<button type="button">Click</button>),
    '@omniviewdev/base-ui': () => wrapOv(<OvButton>Click</OvButton>),
    '@mui/material': () => wrapMui(<MuiButton>Click</MuiButton>),
  });

  benchCompareMany('mount 100', 100, {
    'raw': (i) => <button key={i} type="button">Item {i}</button>,
    '@omniviewdev/base-ui': (i) => <OvButton key={i}>Item {i}</OvButton>,
    '@mui/material': (i) => <MuiButton key={i}>Item {i}</MuiButton>,
  }, {
    'raw': wrapRaw,
    '@omniviewdev/base-ui': wrapOv,
    '@mui/material': wrapMui,
  });
});
