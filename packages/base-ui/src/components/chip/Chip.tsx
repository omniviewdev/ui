import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { Spacing, StyledComponentProps } from '../../system/types';
import styles from './Chip.module.css';

interface ChipContextValue {
  variant?: StyledComponentProps['variant'];
  color?: StyledComponentProps['color'];
  size?: StyledComponentProps['size'];
  mono?: boolean;
  clickable?: boolean;
}

const ChipContext = createContext<ChipContextValue | null>(null);

export interface ChipProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, StyledComponentProps {
  as?: 'span' | 'div' | 'button';
  mono?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

export interface ChipGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  mono?: boolean;
  clickable?: boolean;
  /** Gap between chips. Default: 1 */
  spacing?: Spacing;
  /** Whether chips wrap to the next line. Default: true */
  wrap?: boolean;
}

const ChipRoot = forwardRef<HTMLElement, ChipProps>(function ChipRoot(
  {
    as,
    className,
    variant,
    color,
    size,
    mono = false,
    clickable = false,
    disabled = false,
    startDecorator,
    endDecorator,
    children,
    ...props
  },
  ref,
) {
  const Element = (clickable ? 'button' : (as ?? 'span')) as 'span' | 'div' | 'button';
  const interactive = Element === 'button';
  const dataProps = {
    ...styleDataAttributes({ variant, color, size }),
    'data-ov-mono': mono ? 'true' : 'false',
    'data-ov-clickable': interactive ? 'true' : 'false',
  } as const;

  if (Element === 'button') {
    return (
      <button
        ref={ref as never}
        type="button"
        disabled={disabled}
        className={cn(styles.Root, className)}
        {...dataProps}
        {...(props as Omit<ComponentPropsWithoutRef<'button'>, 'color'>)}
      >
        {startDecorator ? (
          <span className={styles.Decorator} data-ov-slot="start-decorator">
            {startDecorator}
          </span>
        ) : null}
        <span className={styles.Label}>{children}</span>
        {endDecorator ? (
          <span className={styles.Decorator} data-ov-slot="end-decorator">
            {endDecorator}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <Element ref={ref as never} className={cn(styles.Root, className)} {...dataProps} {...props}>
      {startDecorator ? (
        <span className={styles.Decorator} data-ov-slot="start-decorator">
          {startDecorator}
        </span>
      ) : null}
      <span className={styles.Label}>{children}</span>
      {endDecorator ? (
        <span className={styles.Decorator} data-ov-slot="end-decorator">
          {endDecorator}
        </span>
      ) : null}
    </Element>
  );
});

const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
  {
    className,
    variant,
    color,
    size,
    mono = false,
    clickable = false,
    spacing = 1,
    wrap = true,
    ...props
  },
  ref,
) {
  return (
    <ChipContext.Provider value={{ variant, color, size, mono, clickable }}>
      <div
        ref={ref}
        className={cn(styles.Group, className)}
        data-ov-spacing={String(spacing)}
        data-ov-wrap={wrap ? 'true' : 'false'}
        {...props}
      />
    </ChipContext.Provider>
  );
});

const ChipItem = forwardRef<HTMLElement, ChipProps>(function ChipItem(
  { variant, color, size, mono, clickable, ...props },
  ref,
) {
  const group = useContext(ChipContext);

  return (
    <ChipRoot
      ref={ref}
      variant={variant ?? group?.variant}
      color={color ?? group?.color}
      size={size ?? group?.size}
      mono={mono ?? group?.mono ?? false}
      clickable={clickable ?? group?.clickable ?? false}
      {...props}
    />
  );
});

ChipRoot.displayName = 'Chip';
ChipGroup.displayName = 'Chip.Group';
ChipItem.displayName = 'Chip.Item';

type ChipCompound = typeof ChipRoot & {
  Group: typeof ChipGroup;
  Item: typeof ChipItem;
};

export const Chip = Object.assign(ChipRoot, {
  Group: ChipGroup,
  Item: ChipItem,
}) as ChipCompound;
