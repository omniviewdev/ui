import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type CSSProperties, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconPicker, type IconPickerItem } from './IconPicker';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5XkAAAAASUVORK5CYII=';
const CUSTOM_IMAGE: IconPickerItem = {
  id: 'custom',
  label: 'Team image',
  kind: 'image',
  src: PNG,
  removable: true,
};
const items: IconPickerItem[] = [
  { id: 'folder', label: 'Folder', kind: 'preset', icon: <span>F</span>, keywords: ['directory'] },
  { id: 'disabled', label: 'Unavailable', kind: 'emoji', emoji: '⛔', disabled: true },
  { id: 'rocket', label: 'Rocket', kind: 'emoji', emoji: '🚀', keywords: ['launch'] },
  CUSTOM_IMAGE,
  { id: 'star', label: 'Star', kind: 'emoji', emoji: '⭐' },
  { id: 'tree', label: 'Tree', kind: 'emoji', emoji: '🌲' },
  { id: 'cloud', label: 'Cloud', kind: 'emoji', emoji: '☁️' },
];

function Controlled() {
  const [value, setValue] = useState<string | undefined>('folder');
  return <IconPicker items={items} value={value} onValueChange={setValue} />;
}

describe('IconPicker', () => {
  it('searches labels, emoji and keywords, selects with keyboard, and restores trigger focus', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Choose icon: Folder' });
    await user.click(trigger);
    const search = await screen.findByRole('searchbox', { name: 'Search icons' });
    await waitFor(() => expect(search).toHaveFocus());
    await user.type(search, 'LAUNCH');
    expect(screen.queryByRole('button', { name: 'Folder' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rocket' })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAccessibleName('Choose icon: Rocket'));
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);
    expect(await screen.findByRole('button', { name: 'Folder' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), '🌲');
    expect(screen.getByRole('button', { name: 'Tree' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses native buttons, a single tab stop, grid arrows, Home/End and Space without selecting disabled items', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(<IconPicker items={items} value="folder" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Choose icon: Folder' }));
    const folder = await screen.findByRole('button', { name: 'Folder' });
    const rocket = screen.getByRole('button', { name: 'Rocket' });
    expect(folder.tagName).toBe('BUTTON');
    expect(folder).toHaveAttribute('aria-pressed', 'true');
    expect(folder).toHaveAttribute('tabindex', '0');
    expect(rocket).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    await user.click(screen.getByRole('searchbox'));
    await user.keyboard('{ArrowDown}');
    expect(folder).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(rocket).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('{Home}{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Cloud' })).toHaveFocus();
    await user.keyboard('{Home}{ArrowRight} ');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('rocket');
  });

  it('keeps selection controlled, clears to undefined, and never submits an owning form', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    renderWithTheme(
      <form onSubmit={onSubmit}>
        <IconPicker items={items} value="folder" onValueChange={onValueChange} />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: 'Choose icon: Folder' });
    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: 'Rocket' }));
    expect(onValueChange).toHaveBeenCalledWith('rocket');
    expect(trigger).toHaveAccessibleName('Choose icon: Folder');
    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: 'Clear icon' }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit while pending or commit input-method composition', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const view = renderWithTheme(
      <form onSubmit={onSubmit}>
        <IconPicker items={items} onValueChange={onValueChange} open uploadPending />
      </form>,
    );
    const search = await screen.findByRole('searchbox');
    await user.click(search);
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    view.rerender(<IconPicker items={items} onValueChange={onValueChange} open />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows truthful empty results and never accepts Enter without an enabled result', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(<IconPicker items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Choose icon: None' }));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'not-an-icon');
    expect(screen.getByText('No icons found.')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    await user.clear(search);
    await user.type(search, 'Unavailable');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Clear icon' })).toBeDisabled();
  });

  it('blocks opening a disabled picker and closes a controlled popup when disabled', async () => {
    const user = userEvent.setup();
    const props = { items, onValueChange: vi.fn(), open: true };
    const view = renderWithTheme(<IconPicker {...props} disabled />);
    const trigger = screen.getByRole('button', { name: 'Choose icon: None' });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    view.rerender(<IconPicker {...props} />);
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();
    view.rerender(<IconPicker {...props} disabled />);
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
  });

  it('delegates uploads and same-file retries, reflecting caller pending, errors and new selection', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const onValueChange = vi.fn();
    const props = { items, onUpload, onValueChange, value: 'folder', open: true };
    const view = renderWithTheme(<IconPicker {...props} />);
    const file = new File(['caller validates bytes'], 'team.png', { type: 'image/png' });
    const input = await screen.findByLabelText('Upload icon file');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,image/gif,image/webp');
    await user.upload(input, file);
    expect(onUpload).toHaveBeenCalledExactlyOnceWith(file);
    expect(onValueChange).not.toHaveBeenCalled();
    view.rerender(<IconPicker {...props} uploadPending />);
    expect(await screen.findByText('Uploading image…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rocket' })).toBeDisabled();
    view.rerender(<IconPicker {...props} uploadError="Image dimensions exceed policy." />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Image dimensions exceed policy.');
    await user.upload(screen.getByLabelText('Upload icon file'), file);
    expect(onUpload).toHaveBeenCalledTimes(2);
    view.rerender(<IconPicker {...props} value="custom" />);
    expect(screen.getByRole('button', { name: 'Choose icon: Team image' })).toBeInTheDocument();
  });

  it('limits upload hints to a caller raster subset and disables an empty subset', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const props = { items, onUpload, onValueChange: vi.fn(), open: true };
    const view = renderWithTheme(
      <IconPicker {...props} accept={['image/png', 'image/jpeg', 'image/webp']} />,
    );
    const input = await screen.findByLabelText('Upload icon file');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp');
    await user.upload(input, new File(['GIF89a'], 'image.gif', { type: 'image/gif' }));
    expect(onUpload).not.toHaveBeenCalled();
    const png = new File(['caller validates bytes'], 'image.png', { type: 'image/png' });
    await user.upload(input, png);
    expect(onUpload).toHaveBeenCalledExactlyOnceWith(png);
    view.rerender(<IconPicker {...props} accept={[]} />);
    expect(screen.getByLabelText('Upload icon file')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upload image' })).toBeDisabled();
  });

  it('delegates asset removal without clearing caller state, showing removal errors and pending', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onValueChange = vi.fn();
    const props = { items, onRemove, onValueChange, value: 'custom', open: true };
    const view = renderWithTheme(<IconPicker {...props} />);
    await user.click(await screen.findByRole('button', { name: 'Remove selected image' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('custom');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Team image' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    view.rerender(<IconPicker {...props} removePending />);
    expect(await screen.findByRole('button', { name: 'Removing…' })).toBeDisabled();
    expect(screen.getByText('Removing image…')).toBeInTheDocument();
    view.rerender(<IconPicker {...props} removeError="Image is still in use." />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Image is still in use.');
    view.rerender(<IconPicker {...props} value="folder" />);
    expect(screen.queryByRole('button', { name: 'Remove selected image' })).not.toBeInTheDocument();
  });

  it('never renders untrusted network or SVG URLs, including a disguised raster payload', async () => {
    const user = userEvent.setup();
    const unsafe = [
      'https://example.invalid/tracker.png',
      '/relative.png',
      '//example.invalid/image.jpg',
      'data:image/svg+xml;base64,PHN2Zy8+',
      'javascript:alert(1)',
      'data:image/png;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIi8+',
    ];
    renderWithTheme(
      <IconPicker
        items={[
          ...unsafe.map((src, index): IconPickerItem => ({
            id: String(index),
            label: `Unsafe ${index}`,
            kind: 'image',
            src,
          })),
          CUSTOM_IMAGE,
        ]}
        onValueChange={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Choose icon: None' }));
    const group = await screen.findByRole('group', { name: 'Icons' });
    for (let index = 0; index < unsafe.length; index++) {
      expect(
        within(group)
          .getByRole('button', { name: `Unsafe ${index}` })
          .querySelector('img'),
      ).toBeNull();
    }
    expect(
      within(group).getByRole('button', { name: 'Team image' }).querySelector('img'),
    ).toHaveAttribute('src', PNG);
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'forwards %s to native controls, preview and popup',
    async (size) => {
      const user = userEvent.setup();
      renderWithTheme(<IconPicker items={items} size={size} onValueChange={vi.fn()} />);
      const trigger = screen.getByRole('button', { name: 'Choose icon: None' });
      expect(trigger).toHaveAttribute('data-ov-size', size);
      expect(trigger.querySelector('[data-ov-avatar-root]')).toHaveAttribute('data-ov-size', size);
      await user.click(trigger);
      const popup = await screen.findByRole('dialog');
      expect(popup).toHaveAttribute('data-ov-size', size);
    },
  );

  it.each(['compact', 'comfortable'])(
    'keeps an initially open popup within its custom %s scope',
    async (density) => {
      renderWithTheme(
        <section
          data-ov-theme="light"
          data-ov-density={density}
          data-testid="theme-scope"
          style={{ '--ov-color-bg-control': 'Canvas' } as CSSProperties}
        >
          <IconPicker items={items} onValueChange={vi.fn()} defaultOpen />
        </section>,
      );
      const popup = await screen.findByRole('dialog');
      expect(screen.getByTestId('theme-scope')).toContainElement(popup);
      expect(popup.closest('[data-ov-density]')).toHaveAttribute('data-ov-density', density);
    },
  );
});
