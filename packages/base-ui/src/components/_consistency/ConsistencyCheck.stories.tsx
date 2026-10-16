import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { LuChevronDown } from 'react-icons/lu';
import { Badge } from '../badge';
import { Button } from '../button';
import { Card } from '../card';
import { Checkbox } from '../checkbox';
import { Chip } from '../chip';
import { DataTable } from '../data-table/DataTable';
import { useDataTable } from '../data-table/hooks/useDataTable';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { MultiSelect } from '../multi-select';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { Select } from '../select';
import { Separator } from '../separator';
import { Switch } from '../switch';
import { Table } from '../table';
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
        subtitle="Field controls share one height per tier at the active density. Chips, choice marks, switch tracks, and badge markers use compact scales; the guide checks their center alignment, not equal visual height."
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
        {[
          '',
          'Button',
          'IconButton',
          'Input',
          'Select',
          'Chip (compact)',
          'Checkbox (mark)',
          'Radio (mark)',
          'Switch (track)',
          'Badge (28px host)',
        ].map((label) => (
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

      {/* Size rows */}
      {SIZES.map((size) => (
        <div
          key={size}
          data-testid={`audit-size-${size}`}
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
              field tier
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
              <Input.Control aria-label={`${size} input`} placeholder="Value" />
            </Input.Root>
          </div>

          {/* Select */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Select.Root size={size} variant="soft" color="brand">
              <Select.Trigger aria-label={`${size} select`} style={{ width: '100%' }}>
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

          {/* Checkbox (control only — no label, to measure control height) */}
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}
          >
            <Checkbox.Item
              aria-label={`${size} checkbox`}
              size={size}
              variant="soft"
              color="brand"
              defaultChecked
            />
          </div>

          {/* Radio (control only — no label) */}
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}
          >
            <RadioGroup
              defaultValue="yes"
              color="brand"
              variant="soft"
              size={size}
              orientation="horizontal"
              style={{ justifyContent: 'center' }}
            >
              <Radio.Item aria-label={`${size} radio`} value="yes" />
            </RadioGroup>
          </div>

          {/* Switch */}
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
            <Switch
              aria-label={`${size} switch`}
              size={size}
              variant="soft"
              color="brand"
              defaultChecked
            />
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
              <IconButton size={size} variant="soft" color="brand" aria-label={`Search ${size}`}>
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
          Interactive visual reference. Use the theme and density toolbar, and resize the panel to
          stress-test layouts.
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

interface BoundaryResource {
  name: string;
  namespace: string;
  status: string;
}

const boundaryResources: BoundaryResource[] = [
  { name: 'api-gateway', namespace: 'production', status: 'Ready' },
  { name: 'worker', namespace: 'production', status: 'Ready' },
  { name: 'scheduler', namespace: 'staging', status: 'Pending' },
];

const boundaryColumns: ColumnDef<BoundaryResource, unknown>[] = [
  { accessorKey: 'name', header: 'Resource', size: 240 },
  { accessorKey: 'namespace', header: 'Namespace', size: 180 },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

const boundaryNamespaces = ['production', 'staging', 'system'];

function BoundaryHierarchyFixture() {
  const table = useDataTable({
    data: boundaryResources,
    columns: boundaryColumns,
    getRowId: (row) => row.name,
  });

  return (
    <main
      data-testid="boundary-hierarchy"
      aria-label="Boundary hierarchy"
      style={{
        padding: 24,
        display: 'grid',
        gap: 16,
        minHeight: '100vh',
        background: 'var(--ov-color-bg-base)',
        color: 'var(--ov-color-fg-default)',
        fontFamily: 'var(--ov-font-sans)',
      }}
    >
      <SectionHeader
        title="Boundary hierarchy"
        subtitle="Quiet enclosures and row rules, identifiable controls, independent focus, and shared popup edges."
      />
      <Card
        data-testid="boundary-outer-card"
        variant="outline"
        color="neutral"
        surface="default"
        size="sm"
      >
        <Card.Header>
          <Card.Title>Resource inspector</Card.Title>
          <Card.Description>One outer frame with quiet nested content.</Card.Description>
        </Card.Header>
        <Separator data-testid="boundary-horizontal-separator" />
        <Card.Body style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            <Card
              data-testid="boundary-inner-card"
              variant="outline"
              color="neutral"
              surface="default"
              size="sm"
              style={{ flex: 1 }}
            >
              <Card.Body>
                <Card.KeyValue label="Name">api-gateway</Card.KeyValue>
                <Card.KeyValue label="Namespace">production</Card.KeyValue>
              </Card.Body>
            </Card>
            <Separator data-testid="boundary-vertical-separator" orientation="vertical" />
            <Card variant="ghost" color="neutral" surface="default" size="sm" style={{ flex: 1 }}>
              <Card.Body>
                <Card.KeyValue label="Replicas">3 / 3</Card.KeyValue>
                <Card.KeyValue label="Node">worker-01</Card.KeyValue>
              </Card.Body>
            </Card>
          </div>
          <Separator
            data-testid="boundary-labeled-separator"
            label="Selection controls"
            labelAlign="start"
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ width: 220 }} data-testid="boundary-select">
              <Select.Root defaultValue="production" variant="soft" color="neutral">
                <Select.Trigger aria-label="Boundary namespace">
                  <Select.Value />
                  <Select.Icon>
                    <LuChevronDown />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner sideOffset={6}>
                    <Select.Popup data-testid="boundary-select-popup">
                      <Select.List>
                        <Select.Item value="production">
                          <Select.ItemText>production</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="staging">
                          <Select.ItemText>staging</Select.ItemText>
                        </Select.Item>
                        <Select.Separator />
                        <Select.Item value="system">
                          <Select.ItemText>system</Select.ItemText>
                        </Select.Item>
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
            <div style={{ width: 280 }} data-testid="boundary-multiselect">
              <MultiSelect
                items={boundaryNamespaces}
                defaultValue={['production']}
                label="Boundary namespaces"
                triggerLabel="Open boundary namespaces"
                searchPlaceholder="Search boundary namespaces"
                popupClassName="boundary-multiselect-popup"
                variant="soft"
                color="neutral"
              />
            </div>
            <Input>
              <Input.Control aria-label="Boundary resource filter" placeholder="Filter resources" />
            </Input>
            <Checkbox>Include inactive</Checkbox>
            <Switch>Live updates</Switch>
          </div>
          <Separator data-testid="boundary-data-separator" label="Resources" />
          <DataTable.Root
            data-testid="boundary-data-table"
            table={table}
            variant="outline"
            color="neutral"
            size="sm"
          >
            <DataTable.Container>
              <DataTable.Header />
              <DataTable.Body />
            </DataTable.Container>
          </DataTable.Root>
          <Table.Root
            data-testid="boundary-table"
            aria-label="Boundary resource summary"
            variant="outline"
            color="neutral"
            size="sm"
          >
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Resource</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {boundaryResources.map((resource) => (
                <Table.Row key={resource.name}>
                  <Table.Cell>{resource.name}</Table.Cell>
                  <Table.Cell>{resource.status}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card>
    </main>
  );
}

export const BoundaryHierarchy: Story = {
  render: () => <BoundaryHierarchyFixture />,
  parameters: { controls: { disable: true } },
};
