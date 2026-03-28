import { describe } from 'vitest';
import { TextField as OvTextField } from '@omniviewdev/base-ui';
import MuiTextField from '@mui/material/TextField';
import { benchCompare, benchCompareMany } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('TextField competitive', () => {
  benchCompare('mount', {
    'raw': () => wrapRaw(
      <div>
        <label htmlFor="raw-input">Name</label>
        <input id="raw-input" type="text" placeholder="Enter name" />
      </div>,
    ),
    '@omniviewdev/base-ui': () => wrapOv(
      <OvTextField.Root>
        <OvTextField.Label>Name</OvTextField.Label>
        <OvTextField.Control placeholder="Enter name" />
      </OvTextField.Root>,
    ),
    '@mui/material': () => wrapMui(
      <MuiTextField label="Name" placeholder="Enter name" size="small" />,
    ),
  });

  benchCompareMany('mount 100', 100, {
    'raw': (i) => <input key={i} type="text" placeholder={`Field ${i}`} />,
    '@omniviewdev/base-ui': (i) => (
      <OvTextField.Root key={i}>
        <OvTextField.Control placeholder={`Field ${i}`} />
      </OvTextField.Root>
    ),
    '@mui/material': (i) => (
      <MuiTextField key={i} placeholder={`Field ${i}`} size="small" />
    ),
  }, {
    'raw': wrapRaw,
    '@omniviewdev/base-ui': wrapOv,
    '@mui/material': wrapMui,
  });
});
