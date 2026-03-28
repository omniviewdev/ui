import { describe } from 'vitest';
import { Checkbox as OvCheckbox } from '@omniviewdev/base-ui';
import MuiCheckbox from '@mui/material/Checkbox';
import { benchCompare } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('Checkbox competitive', () => {
  benchCompare('mount', {
    'raw': () => wrapRaw(<input type="checkbox" />),
    '@omniviewdev/base-ui': () => wrapOv(<OvCheckbox />),
    '@mui/material': () => wrapMui(<MuiCheckbox />),
  });
});
