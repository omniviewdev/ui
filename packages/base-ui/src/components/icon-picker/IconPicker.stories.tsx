import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LuCloud, LuDatabase, LuFolder, LuServer, LuShield, LuTerminal } from 'react-icons/lu';
import type { ComponentSize } from '../../system/types';
import { BUILT_IN_THEMES } from '../../theme/registry/catalog';
import { Input } from '../input';
import { IconPicker, type IconPickerItem, type IconPickerProps } from './IconPicker';
import { ICON_PICKER_RASTER_TYPES, safeRasterDataSource } from './imageSources';
import styles from './IconPicker.stories.module.css';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5XkAAAAASUVORK5CYII=';
const SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const ITEMS: IconPickerItem[] = [
  { id: 'folder', label: 'Folder', kind: 'preset', icon: <LuFolder />, keywords: ['directory'] },
  { id: 'cloud', label: 'Cloud', kind: 'preset', icon: <LuCloud />, keywords: ['provider'] },
  { id: 'server', label: 'Server', kind: 'preset', icon: <LuServer />, keywords: ['compute'] },
  {
    id: 'database',
    label: 'Database',
    kind: 'preset',
    icon: <LuDatabase />,
    keywords: ['storage'],
  },
  { id: 'shield', label: 'Shield', kind: 'preset', icon: <LuShield />, keywords: ['security'] },
  { id: 'terminal', label: 'Terminal', kind: 'preset', icon: <LuTerminal /> },
  { id: 'rocket', label: 'Rocket', kind: 'emoji', emoji: '🚀', keywords: ['launch'] },
  { id: 'tree', label: 'Tree', kind: 'emoji', emoji: '🌲', keywords: ['nature'] },
  { id: 'star', label: 'Star', kind: 'emoji', emoji: '⭐', keywords: ['favorite'] },
  { id: 'ocean', label: 'Ocean', kind: 'emoji', emoji: '🌊' },
  { id: 'locked', label: 'Unavailable icon', kind: 'emoji', emoji: '🔒', disabled: true },
  {
    id: 'team',
    label: 'Team image',
    kind: 'image',
    src: PNG,
    removable: true,
    keywords: ['custom'],
  },
];

function Controlled(props: IconPickerProps) {
  const [value, setValue] = useState<string | undefined>(props.value);
  return <IconPicker {...props} value={value} onValueChange={setValue} />;
}

function UploadLibrary() {
  const [items, setItems] = useState(ITEMS);
  const [value, setValue] = useState<string | undefined>('folder');
  const [name, setName] = useState('Team icon');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(file: File) {
    setPending(true);
    setError(undefined);
    try {
      const label = name.trim();
      if (!label) throw new Error('Enter an icon name before uploading.');
      if (items.some((item) => item.label.toLocaleLowerCase() === label.toLocaleLowerCase())) {
        throw new Error('Choose a unique icon name.');
      }
      if (!ICON_PICKER_RASTER_TYPES.some((type) => type === file.type)) {
        throw new Error('Choose a PNG, JPEG, GIF or WebP raster image.');
      }
      if (!file.size || file.size > 2 * 1024 * 1024)
        throw new Error('Choose an image smaller than 2 MiB.');
      const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const headerSource = `data:${file.type};base64,${btoa(String.fromCharCode(...header))}`;
      if (!safeRasterDataSource(headerSource))
        throw new Error('File contents do not match its raster image type.');
      const bitmap = await createImageBitmap(file);
      try {
        if (!bitmap.width || !bitmap.height || bitmap.width > 4096 || bitmap.height > 4096) {
          throw new Error('Image dimensions must be between 1 and 4096 pixels.');
        }
        const ratio = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
        canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image conversion is unavailable.');
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const src = canvas.toDataURL('image/png');
        if (!safeRasterDataSource(src))
          throw new Error('Image conversion did not produce a safe raster.');
        const id = crypto.randomUUID();
        setItems((current) => [...current, { id, label, kind: 'image', src, removable: true }]);
        setValue(id);
        setName('');
      } finally {
        bitmap.close();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image could not be decoded.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.Panel}>
      <h3>Caller-owned named icon library</h3>
      <p>
        Upload a real raster file. This story validates, decodes and converts it locally. No file
        leaves your browser.
      </p>
      <Input.Root>
        <Input.Label>New icon name</Input.Label>
        <Input.Control
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={pending}
        />
      </Input.Root>
      <IconPicker
        items={items}
        value={value}
        onValueChange={setValue}
        defaultOpen
        onUpload={(file) => {
          void upload(file);
        }}
        uploadPending={pending}
        uploadError={error}
        onRemove={(id) => {
          setItems((current) => current.filter((item) => item.id !== id));
          if (value === id) setValue(undefined);
        }}
      />
      <p>
        Selection: {items.find((item) => item.id === value)?.label ?? 'None'}. Story library resets
        on reload.
      </p>
    </section>
  );
}

const meta = {
  title: 'Components/IconPicker',
  component: IconPicker,
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    value: 'folder',
    onValueChange: () => undefined,
    size: 'md',
    label: 'Choose icon',
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    items: { control: false },
    value: { control: 'select', options: [undefined, ...ITEMS.map((item) => item.id)] },
    onValueChange: { control: false },
    onUpload: { control: false },
    onRemove: { control: false },
  },
  render: (args) => <Controlled {...args} />,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SearchAndKeyboard: Story = {
  args: { defaultOpen: true },
};

export const SelectedAndDisabled: Story = {
  render: (args) => (
    <section className={styles.Panel}>
      <p>
        Tab into a chooser, then use arrows and Home/End. Enter or Space selects; Escape returns
        focus.
      </p>
      <div className={styles.Row}>
        <Controlled {...args} value="rocket" label="Selected icon" defaultOpen />
        <Controlled {...args} value="team" label="Disabled icon" disabled />
        <Controlled {...args} value={undefined} label="Empty selection" />
      </div>
    </section>
  ),
};

export const UploadAndLibrary: Story = { render: () => <UploadLibrary /> };

export const EmptyAndErrors: Story = {
  args: {
    items: [],
    value: undefined,
    defaultOpen: true,
    uploadError: 'Caller rejected the upload: choose a raster image smaller than 2 MiB.',
    removeError: 'Caller retained the asset because it is still in use.',
  },
};

export const ThemeSizeMatrix: Story = {
  render: (args) => (
    <div className={styles.Catalog}>
      {BUILT_IN_THEMES.map((theme) => (
        <section key={theme.id} data-ov-theme={theme.id} className={styles.Panel}>
          <h3>{theme.name}</h3>
          {(['compact', 'comfortable'] as const).map((density) => (
            <div key={density} data-ov-density={density} className={styles.Density}>
              <h4>{density}</h4>
              <div className={styles.Row}>
                {SIZES.map((size) => (
                  <div key={size} className={styles.Size}>
                    <span>{size}</span>
                    <Controlled
                      {...args}
                      size={size}
                      label={`${theme.name} ${density} ${size} icon`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

export const NestedCustomReducedMotion: Story = {
  render: (args) => (
    <section data-ov-theme="dark" className={styles.Panel}>
      <h3>Dark parent</h3>
      <Controlled {...args} label="Dark parent icon" />
      <section data-ov-theme="light" className={styles.Panel}>
        <h3>Nested light</h3>
        <Controlled {...args} label="Nested light icon" />
        <section data-ov-motion="reduced" className={`${styles.Panel} ${styles.CustomScope}`}>
          <h3>Custom token scope · reduced motion</h3>
          <Controlled {...args} label="Custom scoped icon" value="rocket" defaultOpen />
        </section>
      </section>
    </section>
  ),
};
