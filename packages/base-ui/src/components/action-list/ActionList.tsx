import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import type {
  ComponentColor,
  ComponentSize,
  ComponentVariant,
  StyledComponentProps,
} from '../../system/types';
import { Button, type ButtonProps } from '../button';
import styles from './ActionList.module.css';

type ActionListItemVariant = NonNullable<ComponentVariant>;

interface ActionListContextValue {
  color: ComponentColor;
  size: ComponentSize;
  itemVariant: ActionListItemVariant;
}

const ActionListContext = createContext<ActionListContextValue | null>(null);

export interface ActionListProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'role'>,
    Pick<StyledComponentProps, 'color' | 'size'> {
  itemVariant?: ActionListItemVariant;
}

export interface ActionListItemProps extends Omit<ButtonProps, 'children'> {
  children?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  leadingIcon?: ReactNode;
  trailingContent?: ReactNode;
  icon?: ReactNode;
  shortcut?: ReactNode;
  /** @deprecated Use `leadingIcon` */
  startAdornment?: ReactNode;
  /** @deprecated Use `trailingContent` */
  endAdornment?: ReactNode;
}

export type ActionListGroupLabelProps = HTMLAttributes<HTMLDivElement>;
export type ActionListSeparatorProps = HTMLAttributes<HTMLDivElement>;

const ActionListRoot = forwardRef<HTMLDivElement, ActionListProps>(function ActionListRoot(
  { className, color = 'neutral', size = 'md', itemVariant = 'ghost', ...props },
  ref,
) {
  return (
    <ActionListContext.Provider value={{ color, size, itemVariant }}>
      <div
        ref={ref}
        data-ov-size={size}
        role="list"
        className={cn(styles.Root, className)}
        {...props}
      />
    </ActionListContext.Provider>
  );
});

const ActionListItem = forwardRef<HTMLElement, ActionListItemProps>(function ActionListItem(
  {
    className,
    variant,
    color,
    size,
    leadingIcon,
    trailingContent,
    icon,
    shortcut,
    startAdornment,
    endAdornment,
    label,
    description,
    children,
    ...props
  },
  ref,
) {
  const list = useContext(ActionListContext);
  const resolvedLeading = leadingIcon ?? icon ?? startAdornment;
  const resolvedTrailing = trailingContent ?? shortcut ?? endAdornment;
  const resolvedLabel = label ?? children;

  return (
    <Button
      ref={ref}
      className={withBaseClassName(styles.Item, className)}
      variant={variant ?? list?.itemVariant ?? 'ghost'}
      color={color ?? list?.color ?? 'neutral'}
      size={size ?? list?.size ?? 'md'}
      startDecorator={resolvedLeading}
      endDecorator={resolvedTrailing}
      {...props}
    >
      <span className={styles.Content}>
        <span className={styles.Label}>{resolvedLabel}</span>
        {description ? <span className={styles.Description}>{description}</span> : null}
      </span>
    </Button>
  );
});

const ActionListGroupLabel = forwardRef<HTMLDivElement, ActionListGroupLabelProps>(
  function ActionListGroupLabel({ className, ...props }, ref) {
    const list = useContext(ActionListContext);
    return (
      <div
        ref={ref}
        className={cn(styles.GroupLabel, className)}
        data-ov-size={list?.size ?? 'md'}
        {...props}
      />
    );
  },
);

const ActionListSeparator = forwardRef<HTMLDivElement, ActionListSeparatorProps>(
  function ActionListSeparator({ className, ...props }, ref) {
    return (
      <div ref={ref} role="separator" className={cn(styles.Separator, className)} {...props} />
    );
  },
);

ActionListRoot.displayName = 'ActionList';
ActionListItem.displayName = 'ActionList.Item';
ActionListGroupLabel.displayName = 'ActionList.GroupLabel';
ActionListSeparator.displayName = 'ActionList.Separator';

type ActionListCompound = typeof ActionListRoot & {
  Item: typeof ActionListItem;
  GroupLabel: typeof ActionListGroupLabel;
  Separator: typeof ActionListSeparator;
};

export const ActionList = Object.assign(ActionListRoot, {
  Item: ActionListItem,
  GroupLabel: ActionListGroupLabel,
  Separator: ActionListSeparator,
}) as ActionListCompound;
