import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState } from 'react';
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
    scrollback: { control: { type: 'number', min: 0, max: 50000, step: 500 } },
    cursorBlink: { control: 'boolean' },
    convertEol: { control: 'boolean' },
    macOptionIsMeta: { control: 'boolean' },
    macOptionClickForcesSelection: { control: 'boolean' },
    linkHandling: { control: 'boolean' },
    allowTransparency: { control: 'boolean' },
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

/** Writes simulated `ls -la` output to demonstrate basic text rendering. */
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

/** Demonstrates ANSI color codes in terminal output. */
function AnsiColorsStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      const t = ref.current;
      t.writeln('\x1b[1mBold text\x1b[0m');
      t.writeln('\x1b[3mItalic text\x1b[0m');
      t.writeln('\x1b[4mUnderlined text\x1b[0m');
      t.writeln('');
      t.writeln('Standard colors:');
      t.writeln(
        '  \x1b[30mBlack\x1b[0m \x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[33mYellow\x1b[0m \x1b[34mBlue\x1b[0m \x1b[35mMagenta\x1b[0m \x1b[36mCyan\x1b[0m \x1b[37mWhite\x1b[0m',
      );
      t.writeln('');
      t.writeln('Bright colors:');
      t.writeln(
        '  \x1b[90mBlack\x1b[0m \x1b[91mRed\x1b[0m \x1b[92mGreen\x1b[0m \x1b[93mYellow\x1b[0m \x1b[94mBlue\x1b[0m \x1b[95mMagenta\x1b[0m \x1b[96mCyan\x1b[0m \x1b[97mWhite\x1b[0m',
      );
      t.writeln('');
      t.writeln('Background colors:');
      t.writeln(
        '  \x1b[41m Red \x1b[0m \x1b[42m Green \x1b[0m \x1b[43m Yellow \x1b[0m \x1b[44m Blue \x1b[0m \x1b[45m Magenta \x1b[0m \x1b[46m Cyan \x1b[0m',
      );
      t.writeln('');
      t.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} />;
}

export const AnsiColors: Story = {
  render: (args) => <AnsiColorsStory {...args} />,
};

/** Demonstrates high-throughput output with rapid line writes. */
function HighThroughputStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      ref.current.writeln('$ cat /var/log/system.log | head -200');
      for (let i = 0; i < 200; i++) {
        const level =
          i % 10 === 0
            ? '\x1b[31mERROR\x1b[0m'
            : i % 5 === 0
              ? '\x1b[33mWARN\x1b[0m'
              : '\x1b[32mINFO\x1b[0m';
        ref.current.writeln(
          `2024-01-15T10:${String(i % 60).padStart(2, '0')}:00Z  ${level}  service.handler  Request processed in ${Math.floor(Math.random() * 500)}ms`,
        );
      }
      ref.current.writeln('');
      ref.current.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} />;
}

export const HighThroughput: Story = {
  render: (args) => <HighThroughputStory {...args} />,
};

/** Interactive terminal that echoes typed input. */
function InteractiveStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);
  const [line, setLine] = useState('');

  const handleData = (data: string) => {
    if (!ref.current) return;
    if (data === '\r') {
      ref.current.writeln('');
      if (line.trim()) {
        ref.current.writeln(`\x1b[36m> ${line}\x1b[0m`);
      }
      setLine('');
      ref.current.write('$ ');
    } else if (data === '\x7f') {
      // Backspace
      if (line.length > 0) {
        setLine((prev) => prev.slice(0, -1));
        ref.current.write('\b \b');
      }
    } else {
      setLine((prev) => prev + data);
      ref.current.write(data);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      ref.current?.writeln('Interactive echo terminal. Type something and press Enter.');
      ref.current?.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} onData={handleData} />;
}

export const Interactive: Story = {
  render: (args) => <InteractiveStory {...args} />,
};

/** Demonstrates the onResize callback by displaying current dimensions. */
function ResizeDemoStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  const handleResize = (cols: number, rows: number) => {
    ref.current?.writeln(`\x1b[33m[resize] ${cols} cols x ${rows} rows\x1b[0m`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dims = ref.current?.getDimensions();
      ref.current?.writeln('Resize this panel to see dimension changes.');
      if (dims) {
        ref.current?.writeln(`Current: ${dims.cols} cols x ${dims.rows} rows`);
      }
      ref.current?.writeln('');
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} onResize={handleResize} />;
}

export const ResizeDemo: Story = {
  render: (args) => <ResizeDemoStory {...args} />,
  decorators: [
    (Story) => (
      <div style={{ height: 300, resize: 'both', overflow: 'hidden', border: '1px solid #555' }}>
        <Story />
      </div>
    ),
  ],
};

/** Shows different font sizes side by side. */
function FontSizesStory() {
  return (
    <div style={{ display: 'flex', gap: 16, height: 300 }}>
      {[10, 13, 16, 20].map((size) => (
        <FontSizePanel key={size} fontSize={size} />
      ))}
    </div>
  );
}

function FontSizePanel({ fontSize }: { fontSize: number }) {
  const ref = useRef<TerminalHandle>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.writeln(`fontSize: ${fontSize}`);
      ref.current?.writeln('$ echo "Hello"');
      ref.current?.writeln('Hello');
    }, 300);
    return () => clearTimeout(t);
  }, [fontSize]);
  return (
    <div style={{ flex: 1 }}>
      <Terminal ref={ref} fontSize={fontSize} />
    </div>
  );
}

export const FontSizes: Story = {
  render: () => <FontSizesStory />,
  decorators: [],
};

/** Large scrollback buffer demonstration. */
function LargeScrollbackStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      for (let i = 1; i <= 1000; i++) {
        ref.current.writeln(`Line ${i}: ${'x'.repeat(40)}`);
      }
      ref.current.writeln('');
      ref.current.writeln('\x1b[32mScroll up to see 1000 lines of output.\x1b[0m');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} scrollback={10000} />;
}

export const LargeScrollback: Story = {
  render: (args) => <LargeScrollbackStory {...args} />,
};

/** Demonstrates clickable URL links in terminal output. */
function ClickableLinksStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      ref.current.writeln('Terminal with clickable links (hover to see):');
      ref.current.writeln('');
      ref.current.writeln('  https://github.com/omniviewdev/omniview');
      ref.current.writeln('  https://example.com/api/v1/resources');
      ref.current.writeln('  http://localhost:3000/dashboard');
      ref.current.writeln('');
      ref.current.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return <Terminal ref={ref} {...args} linkHandling />;
}

export const ClickableLinks: Story = {
  render: (args) => <ClickableLinksStory {...args} />,
};
