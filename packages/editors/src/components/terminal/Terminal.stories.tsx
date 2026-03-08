import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect } from 'react';
import { Terminal, type TerminalHandle, type TerminalProps } from './Terminal';

const meta: Meta<typeof Terminal> = {
  title: 'Editors/Terminal',
  component: Terminal,
  tags: ['autodocs'],
  args: {
    fontSize: 13,
  },
  argTypes: {
    fontSize: { control: { type: 'range', min: 10, max: 24, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function WithOutputStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.writeln('$ ls -la');
        ref.current.writeln('total 48');
        ref.current.writeln('drwxr-xr-x   8 user staff  256 Jan  1 12:00 .');
        ref.current.writeln('drwxr-xr-x  10 user staff  320 Jan  1 11:00 ..');
        ref.current.writeln('-rw-r--r--   1 user staff  1234 Jan  1 12:00 package.json');
        ref.current.writeln('-rw-r--r--   1 user staff   567 Jan  1 12:00 tsconfig.json');
        ref.current.writeln('drwxr-xr-x   5 user staff  160 Jan  1 12:00 src');
        ref.current.writeln('');
        ref.current.write('$ ');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} />;
}

export const WithOutput: Story = {
  render: (args) => <WithOutputStory {...args} />,
};
