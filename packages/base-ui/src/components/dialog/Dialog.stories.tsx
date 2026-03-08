import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuAlertTriangle, LuSettings, LuTrash2 } from 'react-icons/lu';
import { Dialog, type DialogSize } from './Dialog';

function PlaygroundDemo({ size }: { size?: DialogSize }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Dialog
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} size={size}>
        <Dialog.Close />
        <Dialog.Title>Dialog Title</Dialog.Title>
        <Dialog.Body>
          <p>This is a general-purpose dialog for displaying arbitrary content.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Confirm
          </button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function SizeVariantsDemo() {
  const sizes: DialogSize[] = ['sm', 'md', 'lg', 'xl'];
  const [activeSize, setActiveSize] = useState<DialogSize | null>(null);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {sizes.map((size) => (
        <button key={size} type="button" onClick={() => setActiveSize(size)}>
          {size.toUpperCase()}
        </button>
      ))}
      {activeSize ? (
        <Dialog open size={activeSize} onClose={() => setActiveSize(null)}>
          <Dialog.Close />
          <Dialog.Title>Size: {activeSize}</Dialog.Title>
          <Dialog.Body>
            <p>
              This dialog uses the <strong>{activeSize}</strong> size variant.
            </p>
          </Dialog.Body>
          <Dialog.Footer>
            <button type="button" onClick={() => setActiveSize(null)}>
              Close
            </button>
          </Dialog.Footer>
        </Dialog>
      ) : null}
    </div>
  );
}

function FormContentDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Edit Settings
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} size="md">
        <Dialog.Close />
        <Dialog.Title icon={<LuSettings />}>Settings</Dialog.Title>
        <Dialog.Body>
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            <label>
              Name
              <input
                type="text"
                defaultValue="My Workspace"
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                defaultValue="A sample workspace"
                style={{ display: 'block', width: '100%' }}
              />
            </label>
          </form>
        </Dialog.Body>
        <Dialog.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Save
          </button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function ScrollableBodyDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Scrollable Dialog
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} size="md">
        <Dialog.Close />
        <Dialog.Title>Terms of Service</Dialog.Title>
        <Dialog.Body>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Paragraph {i + 1}.
            </p>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Decline
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Accept
          </button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function WithIconInTitleDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete Item
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} size="sm">
        <Dialog.Close />
        <Dialog.Title icon={<LuAlertTriangle />}>Confirm Deletion</Dialog.Title>
        <Dialog.Body>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            <LuTrash2 style={{ marginRight: 4 }} />
            Delete
          </button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    open: { control: false },
    onClose: { control: false },
  },
  parameters: {
    controls: {
      include: ['size'],
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    open: false,
    onClose: () => {},
    size: 'md',
  },
  render: (args) => <PlaygroundDemo size={args.size} />,
};

export const SizeVariants: Story = {
  args: { open: false, onClose: () => {} },
  render: () => <SizeVariantsDemo />,
};

export const WithFormContent: Story = {
  args: { open: false, onClose: () => {} },
  render: () => <FormContentDemo />,
};

export const ScrollableBody: Story = {
  args: { open: false, onClose: () => {} },
  render: () => <ScrollableBodyDemo />,
};

export const WithIconInTitle: Story = {
  args: { open: false, onClose: () => {} },
  render: () => <WithIconInTitleDemo />,
};
