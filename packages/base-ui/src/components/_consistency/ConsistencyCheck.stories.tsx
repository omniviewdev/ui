import type { Meta, StoryObj } from '@storybook/react';
import { LuChevronDown } from 'react-icons/lu';
import { Badge } from '../badge';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Chip } from '../chip';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { Select } from '../select';
import { Switch } from '../switch';
import type { ComponentColor, ComponentSize, ComponentVariant } from '../../system/types';

// ─── Shared icon ──────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

// Expected pixel heights per size tier (informational labels)
const SIZE_HEIGHTS: Record<ComponentSize, string> = {
  xs: '18px',
  sm: '22px',
  md: '28px',
  lg: '34px',
  xl: '42px',
};

const COLORS: ComponentColor[] = [
  'neutral',
  'brand',
  'success',
  'warning',
  'danger',
  'info',
  'discovery',
  'secondary',
];

const VARIANTS: ComponentVariant[] = ['solid', 'soft', 'outline', 'ghost'];

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ov-color-text-tertiary, #888)',
          fontFamily: 'var(--ov-font-sans, sans-serif)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 12,
            color: 'var(--ov-color-text-tertiary, #888)',
            fontFamily: 'var(--ov-font-sans, sans-serif)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Section 1: Size Consistency Grid ────────────────────────────────────────

function SizeConsistencyGrid() {
  return (
    <div style={{ marginBottom: 64 }}>
      <SectionHeader
        title="Section 1 — Size Consistency Grid"
        subtitle="All controls in each row should appear at the same height. The reference line passes through the vertical midpoint."
      />

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px repeat(9, 1fr)',
          gap: 8,
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        {['', 'Button', 'IconButton', 'Input', 'Select', 'Chip', 'Checkbox', 'Radio', 'Switch', 'Badge'].map(
          (label) => (
            <div
              key={label}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--ov-color-text-tertiary, #888)',
                fontFamily: 'var(--ov-font-sans, sans-serif)',
                textAlign: 'center',
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>

      {/* Size rows */}
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '120px repeat(9, 1fr)',
            gap: 8,
            alignItems: 'center',
            paddingTop: 12,
            paddingBottom: 12,
            borderBottom: '1px solid var(--ov-color-border-subtle, #2a2a2a)',
          }}
        >
          {/* Reference line through vertical midpoint */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: 120,
              right: 0,
              height: 1,
              background: 'rgba(255,90,90,0.35)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Row label */}
          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--ov-font-mono, monospace)',
              color: 'var(--ov-color-text-secondary, #ccc)',
              zIndex: 1,
            }}
          >
            <strong>{size}</strong>
            <span
              style={{
                marginLeft: 6,
                opacity: 0.55,
                fontSize: 10,
              }}
            >
              {SIZE_HEIGHTS[size]}
            </span>
          </div>

          {/* Button */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Button size={size} variant="soft" color="brand">
              Label
            </Button>
          </div>

          {/* IconButton */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <IconButton size={size} variant="soft" color="brand" aria-label="Search">
              <SearchIcon />
            </IconButton>
          </div>

          {/* Input */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Input.Root size={size} variant="soft" color="brand" style={{ width: '100%' }}>
              <Input.Control placeholder="Value" />
            </Input.Root>
          </div>

          {/* Select */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Select.Root size={size} variant="soft" color="brand">
              <Select.Trigger style={{ width: '100%' }}>
                <Select.Value placeholder="Select" />
                <Select.Icon>
                  <LuChevronDown aria-hidden />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner sideOffset={6}>
                  <Select.Popup>
                    <Select.List>
                      <Select.Item value="a">
                        <Select.ItemText>Option A</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="b">
                        <Select.ItemText>Option B</Select.ItemText>
                      </Select.Item>
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Chip */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Chip size={size} variant="soft" color="brand">
              Tag
            </Chip>
          </div>

          {/* Checkbox */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Checkbox.Item size={size} variant="soft" color="brand" defaultChecked>
              Check
            </Checkbox.Item>
          </div>

          {/* Radio */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <RadioGroup defaultValue="yes" color="brand" variant="soft" size={size}>
              <Radio.Item value="yes">Radio</Radio.Item>
            </RadioGroup>
          </div>

          {/* Switch */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Switch size={size} variant="soft" color="brand" defaultChecked />
          </div>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Badge content={9} size={size} color="danger">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'var(--ov-color-bg-surface-raised, #333)',
                }}
              />
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section 2: Color × Variant Matrix ───────────────────────────────────────

function ColorVariantMatrix() {
  return (
    <div style={{ marginBottom: 64 }}>
      <SectionHeader
        title="Section 2 — Color × Variant Matrix"
        subtitle="8 colors × 4 variants. Spot missing or broken color/variant combinations."
      />

      {/* Variant column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '100px repeat(4, 1fr)',
          gap: 8,
          marginBottom: 8,
        }}
      >
        {['', ...VARIANTS].map((label) => (
          <div
            key={label}
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ov-color-text-tertiary, #888)',
              fontFamily: 'var(--ov-font-sans, sans-serif)',
              textAlign: 'center',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Dark background section */}
      <div
        style={{
          background: 'var(--ov-color-bg-surface, #18181b)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          border: '1px solid var(--ov-color-border-subtle, #2a2a2a)',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ov-color-text-tertiary, #888)',
            fontFamily: 'var(--ov-font-sans, sans-serif)',
            marginBottom: 12,
          }}
        >
          Dark background
        </div>
        {COLORS.map((color) => (
          <div
            key={color}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px repeat(4, 1fr)',
              gap: 8,
              marginBottom: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--ov-font-mono, monospace)',
                color: 'var(--ov-color-text-secondary, #ccc)',
              }}
            >
              {color}
            </div>
            {VARIANTS.map((variant) => (
              <div key={variant} style={{ display: 'flex', justifyContent: 'center' }}>
                <Button size="sm" color={color} variant={variant}>
                  {variant}
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Light background section */}
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 8,
          padding: 16,
          border: '1px solid #e0e0e0',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#888',
            fontFamily: 'var(--ov-font-sans, sans-serif)',
            marginBottom: 12,
          }}
        >
          Light background
        </div>
        {COLORS.map((color) => (
          <div
            key={color}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px repeat(4, 1fr)',
              gap: 8,
              marginBottom: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--ov-font-mono, monospace)',
                color: '#444',
              }}
            >
              {color}
            </div>
            {VARIANTS.map((variant) => (
              <div key={variant} style={{ display: 'flex', justifyContent: 'center' }}>
                <Button size="sm" color={color} variant={variant}>
                  {variant}
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: IconButton Squareness Check ───────────────────────────────────

function IconButtonSquarenessCheck() {
  return (
    <div style={{ marginBottom: 64 }}>
      <SectionHeader
        title="Section 3 — IconButton Squareness Check"
        subtitle="Each button should be perfectly square (width = height). Misalignment indicates a CSS regression."
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {SIZES.map((size) => (
          <div
            key={size}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
              }}
            >
              {/* Visible square background to expose non-square dimensions */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  outline: '2px dashed rgba(255,90,90,0.5)',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
              <IconButton
                size={size}
                variant="soft"
                color="brand"
                aria-label={`Search ${size}`}
              >
                <SearchIcon />
              </IconButton>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--ov-font-mono, monospace)',
                color: 'var(--ov-color-text-secondary, #ccc)',
              }}
            >
              {size}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Story scaffold ───────────────────────────────────────────────────────────

function AuditPage() {
  return (
    <div
      style={{
        padding: 32,
        minHeight: '100vh',
        fontFamily: 'var(--ov-font-sans, sans-serif)',
        background: 'var(--ov-color-bg-base, #111)',
        color: 'var(--ov-color-text-primary, #eee)',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--ov-color-text-primary, #eee)',
          }}
        >
          Size &amp; Color Audit
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'var(--ov-color-text-tertiary, #888)',
          }}
        >
          Visual reference tool — not interactive. Resize the panel to stress-test layouts.
        </p>
      </div>

      <SizeConsistencyGrid />
      <ColorVariantMatrix />
      <IconButtonSquarenessCheck />
    </div>
  );
}

const meta = {
  title: 'Consistency/Size & Color Audit',
  component: AuditPage,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: { disable: true },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuditPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Audit: Story = {
  parameters: {
    controls: { disable: true },
  },
};
