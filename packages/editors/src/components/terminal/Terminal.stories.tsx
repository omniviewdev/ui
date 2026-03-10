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
    cursorStyle: { control: 'select', options: ['block', 'underline', 'bar'] },
    convertEol: { control: 'boolean' },
    macOptionIsMeta: { control: 'boolean' },
    macOptionClickForcesSelection: { control: 'boolean' },
    linkHandling: { control: 'boolean' },
    allowTransparency: { control: 'boolean' },
    disableStdin: { control: 'boolean' },
    renderer: { control: 'select', options: ['auto', 'webgl', 'dom'] },
    lineHeight: { control: { type: 'range', min: 1.0, max: 2.0, step: 0.1 } },
    letterSpacing: { control: { type: 'range', min: -2, max: 5, step: 0.5 } },
    screenReaderMode: { control: 'boolean' },
    minimumContrastRatio: { control: { type: 'range', min: 1, max: 21, step: 0.5 } },
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

/** Search story — 100 lines of log output with search bar UI. */
function SearchStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);
  const [searchTerm, setSearchTerm] = useState('ERROR');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      for (let i = 0; i < 100; i++) {
        const level =
          i % 10 === 0
            ? '\x1b[31mERROR\x1b[0m'
            : i % 5 === 0
              ? '\x1b[33mWARN\x1b[0m'
              : '\x1b[32mINFO\x1b[0m';
        ref.current.writeln(
          `[${String(i).padStart(3, '0')}] ${level}  Processing request #${i + 1000}`,
        );
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, padding: 8, background: '#1e1e1e', borderBottom: '1px solid #333' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={{ padding: '4px 8px', background: '#2d2d2d', color: '#fff', border: '1px solid #555', borderRadius: 4, fontSize: 13 }}
        />
        <button
          type="button"
          onClick={() => ref.current?.findNext(searchTerm)}
          style={{ padding: '4px 12px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          Find Next
        </button>
        <button
          type="button"
          onClick={() => ref.current?.findPrevious(searchTerm)}
          style={{ padding: '4px 12px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          Find Previous
        </button>
        <button
          type="button"
          onClick={() => ref.current?.clearSearch()}
          style={{ padding: '4px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          Clear
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <Terminal ref={ref} {...args} />
      </div>
    </div>
  );
}

export const Search: Story = {
  render: (args) => <SearchStory {...args} />,
};

/** ReadOnly terminal that streams simulated log output. */
function ReadOnlyStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (!ref.current) return;
      const level = i % 7 === 0 ? '\x1b[31mERROR\x1b[0m' : i % 3 === 0 ? '\x1b[33mWARN\x1b[0m' : '\x1b[32mINFO\x1b[0m';
      const ts = new Date().toISOString();
      ref.current.writeln(`${ts}  ${level}  app.server  Event #${i + 1}`);
      i++;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <Terminal ref={ref} {...args} disableStdin />;
}

export const ReadOnly: Story = {
  render: (args) => <ReadOnlyStory {...args} />,
};

/** Three terminals side-by-side comparing renderers. */
function RendererComparisonStory() {
  return (
    <div style={{ display: 'flex', gap: 8, height: 350 }}>
      {(['webgl', 'dom'] as const).map((r) => (
        <RendererPanel key={r} renderer={r} />
      ))}
    </div>
  );
}

function RendererPanel({ renderer }: { renderer: 'webgl' | 'dom' }) {
  const ref = useRef<TerminalHandle>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!ref.current) return;
      ref.current.writeln(`\x1b[1mRenderer: ${renderer}\x1b[0m`);
      ref.current.writeln('');
      ref.current.writeln('The quick brown fox jumps');
      ref.current.writeln('over the lazy dog.');
      ref.current.writeln('');
      ref.current.writeln('\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[34mBlue\x1b[0m');
    }, 400);
    return () => clearTimeout(t);
  }, [renderer]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '4px 8px', background: '#1e1e1e', color: '#ccc', fontSize: 12, borderBottom: '1px solid #333' }}>
        {renderer.toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <Terminal ref={ref} renderer={renderer} />
      </div>
    </div>
  );
}

export const RendererComparison: Story = {
  render: () => <RendererComparisonStory />,
  decorators: [],
};

/** Serialization — save the buffer content. */
function SerializationStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);
  const [buffer, setBuffer] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current) return;
      ref.current.writeln('$ echo "Hello from the terminal"');
      ref.current.writeln('Hello from the terminal');
      ref.current.writeln('$ date');
      ref.current.writeln('Mon Jan 15 10:30:00 UTC 2024');
      ref.current.writeln('$ whoami');
      ref.current.writeln('developer');
      ref.current.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 8, background: '#1e1e1e', borderBottom: '1px solid #333' }}>
        <button
          type="button"
          onClick={() => setBuffer(ref.current?.getBufferContent() ?? '')}
          style={{ padding: '4px 12px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          Save Buffer
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <Terminal ref={ref} {...args} />
      </div>
      {buffer && (
        <pre style={{ margin: 0, padding: 8, background: '#111', color: '#aaa', fontSize: 12, maxHeight: 120, overflow: 'auto', borderTop: '1px solid #333' }}>
          {buffer}
        </pre>
      )}
    </div>
  );
}

export const Serialization: Story = {
  render: (args) => <SerializationStory {...args} />,
};

/** Custom key handler — intercepts Ctrl+C to show custom behavior. */
function CustomKeyHandlerStory(args: TerminalProps) {
  const ref = useRef<TerminalHandle>(null);
  const [intercepted, setIntercepted] = useState(false);

  const handleKey = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'c') {
      setIntercepted(true);
      ref.current?.writeln('\r\n\x1b[33m[Ctrl+C intercepted by custom handler]\x1b[0m');
      ref.current?.write('$ ');
      setTimeout(() => setIntercepted(false), 1500);
      return false; // Prevent default xterm handling
    }
    return true;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      ref.current?.writeln('Type Ctrl+C to see the custom key handler intercept it.');
      ref.current?.write('$ ');
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {intercepted && (
        <div style={{ padding: '6px 12px', background: '#4a3000', color: '#ffd700', fontSize: 13 }}>
          Ctrl+C was intercepted!
        </div>
      )}
      <div style={{ flex: 1 }}>
        <Terminal ref={ref} {...args} customKeyEventHandler={handleKey} />
      </div>
    </div>
  );
}

export const CustomKeyHandler: Story = {
  render: (args) => <CustomKeyHandlerStory {...args} />,
};
