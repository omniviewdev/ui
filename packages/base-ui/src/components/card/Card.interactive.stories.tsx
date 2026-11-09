import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { BUILT_IN_THEMES } from '../../theme/registry/catalog';
import { Menu } from '../menu';
import { Card } from './Card';
import { Button } from '../button';
import styles from './Card.interactive.stories.module.css';

const meta = {
  title: 'Components/Card/Interactive',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Opt in with interactive. selected is visual state, not an ARIA role. Put a native ActionArea inside Card.Title and use stretched for whole-card navigation. Keep independent Menu triggers in sibling Card.Action slots. Use placement="inline" when the action slot must reserve space in a flex or grid header; corner placement remains the default. Root disabled disables primary ActionAreas; sibling actions own their disabled state.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const names = [
  'Design workspace',
  'Production workspace with a very long name that must remain fully accessible',
  'Research workspace',
  'Archived workspace',
];

function SelectableGallery() {
  const [selected, setSelected] = useState(0);
  const [pinned, setPinned] = useState<string[]>([]);
  const links = useRef<Array<HTMLAnchorElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = links.current.indexOf(event.target as HTMLAnchorElement);
    if (current < 0) return;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % 3;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current + 2) % 3;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 2;
        break;
      default:
        return;
    }
    event.preventDefault();
    links.current[next]?.focus();
  }

  return (
    <div className={styles.Stack}>
      <p className={styles.Note}>
        Arrow keys select and focus a workspace. Enter follows its link. Tab reaches its independent
        actions. Archived workspace is disabled. This is a grouped gallery, not an ARIA grid.
      </p>
      <div
        role="group"
        aria-label="Workspaces"
        className={styles.Gallery}
        onKeyDown={handleKeyDown}
      >
        {names.map((name, index) => (
          <Card
            key={name}
            interactive
            selected={selected === index}
            disabled={index === 3}
            className={styles.Card}
          >
            <Card.Header className={styles.Header}>
              <Card.Eyebrow>{pinned.includes(name) ? 'Pinned' : 'Workspace'}</Card.Eyebrow>
              <Card.Title>
                <Card.ActionArea
                  as="a"
                  href={`#workspace-${index}`}
                  stretched
                  ref={(node) => {
                    links.current[index] = node as HTMLAnchorElement | null;
                  }}
                  tabIndex={selected === index ? 0 : -1}
                  aria-current={selected === index ? 'true' : undefined}
                  onFocus={() => setSelected(index)}
                  title={name}
                >
                  <span className={styles.Name}>{name}</span>
                </Card.ActionArea>
              </Card.Title>
              <Card.Action>
                <Menu.Root>
                  <Menu.Trigger aria-label={`Actions for ${name}`} disabled={index === 3}>
                    ⋯
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner align="end">
                      <Menu.Popup>
                        <Menu.Item
                          onClick={() =>
                            setPinned((items) =>
                              items.includes(name)
                                ? items.filter((item) => item !== name)
                                : [...items, name],
                            )
                          }
                        >
                          {pinned.includes(name) ? 'Unpin workspace' : 'Pin workspace'}
                        </Menu.Item>
                        <Menu.LinkItem href={`#workspace-settings-${index}`}>
                          Workspace settings
                        </Menu.LinkItem>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              </Card.Action>
            </Card.Header>
            <Card.Body className={styles.Body}>
              <Card.Description>
                Shared project space with independent navigation and actions.
              </Card.Description>
            </Card.Body>
            <Card.Footer>
              <Card.Description>{index === 3 ? 'Unavailable' : 'Ready'}</Card.Description>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const SelectableGrid: Story = {
  render: () => <SelectableGallery />,
};

export const States: Story = {
  render: () => (
    <div className={styles.Gallery}>
      {(['Idle / hover me', 'Selected / focus me', 'Disabled'] as const).map((state, index) => (
        <Card
          key={state}
          interactive
          selected={index === 1}
          disabled={index === 2}
          className={styles.Card}
        >
          <Card.Header>
            <Card.Eyebrow>Native button</Card.Eyebrow>
            <Card.Title>
              <Card.ActionArea as="button" stretched aria-pressed={index === 1}>
                {state}
              </Card.ActionArea>
            </Card.Title>
          </Card.Header>
          <Card.Body className={styles.Body}>
            <Card.Description>Hover, focus, and selection remain separate.</Card.Description>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const InlineActions: Story = {
  render: function Render() {
    const [pinned, setPinned] = useState<string[]>([]);
    const [selected, setSelected] = useState('sm');
    return (
      <div className={`${styles.Gallery} ${styles.InlineGallery}`}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Card key={size} size={size} interactive selected={selected === size}>
            <Card.Header>
              <Card.Row align="center">
                <Card.Description style={{ flex: 1, minInlineSize: 0 }}>
                  <span className={styles.Name}>{size} · Workspace</span>
                </Card.Description>
                <Card.Action placement="inline">
                  <Button
                    variant="ghost"
                    aria-pressed={pinned.includes(size)}
                    onClick={() =>
                      setPinned((current) =>
                        current.includes(size)
                          ? current.filter((item) => item !== size)
                          : [...current, size],
                      )
                    }
                  >
                    {pinned.includes(size) ? 'Unpin' : 'Pin'}
                  </Button>
                  <Menu.Root>
                    <Menu.Trigger aria-label={`Actions for ${size} workspace`}>⋯</Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner>
                        <Menu.Popup>
                          <Menu.LinkItem href={`#settings-${size}`}>Settings</Menu.LinkItem>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </Card.Action>
              </Card.Row>
              <Card.Title>
                <Card.ActionArea
                  as="a"
                  href={`#workspace-${size}`}
                  stretched
                  onClick={() => setSelected(size)}
                >
                  <span className={styles.Name}>Workspace with a long descriptive name</span>
                </Card.ActionArea>
              </Card.Title>
            </Card.Header>
          </Card>
        ))}
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className={styles.Gallery}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Card key={size} interactive selected size={size} className={styles.Card}>
          <Card.Header>
            <Card.Eyebrow>{size}</Card.Eyebrow>
            <Card.Title>
              <Card.ActionArea as="a" href={`#size-${size}`} stretched>
                Workspace {size}
              </Card.ActionArea>
            </Card.Title>
          </Card.Header>
          <Card.Body className={styles.Body}>
            <Card.Description>
              Fixed-height composition. Use Storybook density controls.
            </Card.Description>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className={styles.Gallery}>
      {BUILT_IN_THEMES.map((theme) => (
        <div key={theme.id} data-ov-theme={theme.id} className={styles.ThemeRoot}>
          <Card interactive selected>
            <Card.Header>
              <Card.Eyebrow>{theme.id}</Card.Eyebrow>
              <Card.Title>
                <Card.ActionArea as="a" href={`#theme-${theme.id}`} stretched>
                  Selected workspace
                </Card.ActionArea>
              </Card.Title>
            </Card.Header>
          </Card>
        </div>
      ))}
    </div>
  ),
};

export const NestedThemeAndCustomAliases: Story = {
  render: () => (
    <div data-ov-theme="dark" className={`${styles.Stack} ${styles.ThemeRoot}`}>
      <Card interactive selected>
        <Card.Header>
          <Card.Title>Outer dark selection</Card.Title>
        </Card.Header>
      </Card>
      <div data-ov-theme="light" className={`${styles.Stack} ${styles.ThemeRoot}`}>
        <Card interactive selected>
          <Card.Header>
            <Card.Title>Nested light selection</Card.Title>
          </Card.Header>
        </Card>
        <div data-ov-theme="light" className={`${styles.ThemeRoot} ${styles.CustomAliases}`}>
          <Card interactive selected>
            <Card.Header>
              <Card.Title>
                <Card.ActionArea as="a" href="#custom" stretched>
                  Custom semantic aliases
                </Card.ActionArea>
              </Card.Title>
            </Card.Header>
          </Card>
        </div>
      </div>
    </div>
  ),
};

export const NarrowPane: Story = {
  render: () => (
    <div className={styles.Narrow}>
      <SelectableGallery />
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <div data-ov-motion="reduced">
      <SelectableGallery />
    </div>
  ),
};
