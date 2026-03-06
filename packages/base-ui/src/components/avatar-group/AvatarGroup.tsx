import {
  Children,
  createContext,
  forwardRef,
  useContext,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import { Avatar, type AvatarProps, type AvatarShape } from '../avatar';
import styles from './AvatarGroup.module.css';

export type AvatarGroupOverlap = 'sm' | 'md' | 'lg';

interface AvatarGroupContextValue extends StyledComponentProps {
  shape?: AvatarShape;
  deterministic?: boolean;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export interface AvatarGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    StyledComponentProps {
  shape?: AvatarShape;
  deterministic?: boolean;
  overlap?: AvatarGroupOverlap;
  max?: number;
  total?: number;
}

export interface AvatarGroupItemProps
  extends Omit<AvatarProps, 'shape' | 'deterministic' | 'variant' | 'color' | 'size'>,
    StyledComponentProps {
  shape?: AvatarShape;
  deterministic?: boolean;
}

const AvatarGroupRoot = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroupRoot(
  {
    className,
    variant = DEFAULT_VARIANT,
    color = DEFAULT_COLOR,
    size = DEFAULT_SIZE,
    shape = 'circle',
    deterministic = true,
    overlap,
    max,
    total,
    children,
    role = 'group',
    ...props
  },
  ref,
) {
  const clampedMax = typeof max === 'number' ? Math.max(Math.floor(max), 0) : undefined;
  const allChildren = Children.toArray(children);
  const visibleChildren = clampedMax === undefined ? allChildren : allChildren.slice(0, clampedMax);
  const resolvedTotal =
    typeof total === 'number' ? Math.max(Math.floor(total), allChildren.length) : allChildren.length;
  const overflowCount = clampedMax === undefined ? 0 : Math.max(resolvedTotal - visibleChildren.length, 0);

  return (
    <AvatarGroupContext.Provider value={{ variant, color, size, shape, deterministic }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-avatar-group="true"
        data-ov-overlap={overlap}
        role={role}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      >
        {visibleChildren}
        {overflowCount > 0 ? (
          <Avatar
            className={styles.Overflow}
            variant={variant}
            color="neutral"
            size={size}
            shape={shape}
            deterministic={false}
            fallback={`+${overflowCount}`}
            aria-label={`${overflowCount} more`}
          />
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
});

const AvatarGroupItem = forwardRef<ElementRef<typeof Avatar.Root>, AvatarGroupItemProps>(
  function AvatarGroupItem({ variant, color, size, shape, deterministic, ...props }, ref) {
    const group = useContext(AvatarGroupContext);

    return (
      <Avatar
        ref={ref}
        variant={variant ?? group?.variant ?? DEFAULT_VARIANT}
        color={color ?? group?.color ?? DEFAULT_COLOR}
        size={size ?? group?.size ?? DEFAULT_SIZE}
        shape={shape ?? group?.shape ?? 'circle'}
        deterministic={deterministic ?? group?.deterministic ?? true}
        {...props}
      />
    );
  },
);

AvatarGroupRoot.displayName = 'AvatarGroup';
AvatarGroupItem.displayName = 'AvatarGroup.Item';

type AvatarGroupCompound = typeof AvatarGroupRoot & {
  Item: typeof AvatarGroupItem;
};

export const AvatarGroup = Object.assign(AvatarGroupRoot, {
  Item: AvatarGroupItem,
}) as AvatarGroupCompound;
