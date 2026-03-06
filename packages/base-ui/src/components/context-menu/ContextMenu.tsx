import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './ContextMenu.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const ContextMenuStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(ContextMenuStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

interface DecoratedContentProps {
  children?: ReactNode;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

function renderDecoratedContent({ children, startDecorator, endDecorator }: DecoratedContentProps) {
  return (
    <>
      {startDecorator ? <span className={styles.StartDecorator}>{startDecorator}</span> : null}
      {children}
      {endDecorator ? <span className={styles.EndDecorator}>{endDecorator}</span> : null}
    </>
  );
}

export interface ContextMenuRootProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.Root>, 'color'>,
    StyledComponentProps {}

export interface ContextMenuTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger>, 'color'>,
    StyledComponentProps {}

export interface ContextMenuPopupProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>, 'color'>,
    StyledComponentProps {}

export interface ContextMenuItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.Item>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface ContextMenuLinkItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.LinkItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface ContextMenuCheckboxItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface ContextMenuRadioItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface ContextMenuSubmenuTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {
  showCaret?: boolean;
}

const ContextMenuRoot = ({ variant, color, size, ...props }: ContextMenuRootProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <ContextMenuStyleContext.Provider value={resolved}>
      <BaseContextMenu.Root {...props} />
    </ContextMenuStyleContext.Provider>
  );
};

const ContextMenuTrigger = forwardRef<
  ElementRef<typeof BaseContextMenu.Trigger>,
  ContextMenuTriggerProps
>(function ContextMenuTrigger({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.Trigger
      ref={ref}
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const ContextMenuBackdrop = forwardRef<
  ElementRef<typeof BaseContextMenu.Backdrop>,
  ComponentPropsWithoutRef<typeof BaseContextMenu.Backdrop>
>(function ContextMenuBackdrop({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Backdrop
      ref={ref}
      className={withBaseClassName(styles.Backdrop, className)}
      {...props}
    />
  );
});

const ContextMenuPositioner = forwardRef<
  ElementRef<typeof BaseContextMenu.Positioner>,
  ComponentPropsWithoutRef<typeof BaseContextMenu.Positioner>
>(function ContextMenuPositioner({ className, ...props }, ref) {
  return (
    <BaseContextMenu.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const ContextMenuPopup = forwardRef<
  ElementRef<typeof BaseContextMenu.Popup>,
  ContextMenuPopupProps
>(function ContextMenuPopup({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.Popup
      ref={ref}
      className={withBaseClassName(styles.Popup, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const ContextMenuGroupLabel = forwardRef<
  ElementRef<typeof BaseContextMenu.GroupLabel>,
  Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel>, 'color'> & StyledComponentProps
>(function ContextMenuGroupLabel({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.GroupLabel
      ref={ref}
      className={withBaseClassName(styles.GroupLabel, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const ContextMenuSeparator = forwardRef<
  ElementRef<typeof BaseContextMenu.Separator>,
  Omit<ComponentPropsWithoutRef<typeof BaseContextMenu.Separator>, 'color'> & StyledComponentProps
>(function ContextMenuSeparator({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.Separator
      ref={ref}
      className={withBaseClassName(styles.Separator, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const ContextMenuItem = forwardRef<ElementRef<typeof BaseContextMenu.Item>, ContextMenuItemProps>(
  function ContextMenuItem(
    { className, variant, color, size, children, startDecorator, endDecorator, ...props },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseContextMenu.Item
        ref={ref}
        className={withBaseClassName(styles.Item, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({ children, startDecorator, endDecorator })}
      </BaseContextMenu.Item>
    );
  },
);

const ContextMenuLinkItem = forwardRef<
  ElementRef<typeof BaseContextMenu.LinkItem>,
  ContextMenuLinkItemProps
>(function ContextMenuLinkItem(
  { className, variant, color, size, children, startDecorator, endDecorator, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.LinkItem
      ref={ref}
      className={withBaseClassName(styles.LinkItem, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {renderDecoratedContent({ children, startDecorator, endDecorator })}
    </BaseContextMenu.LinkItem>
  );
});

const ContextMenuCheckboxItem = forwardRef<
  ElementRef<typeof BaseContextMenu.CheckboxItem>,
  ContextMenuCheckboxItemProps
>(function ContextMenuCheckboxItem(
  { className, variant, color, size, children, startDecorator, endDecorator, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.CheckboxItem
      ref={ref}
      className={withBaseClassName(styles.CheckboxItem, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {renderDecoratedContent({ children, startDecorator, endDecorator })}
    </BaseContextMenu.CheckboxItem>
  );
});

const ContextMenuCheckboxItemIndicator = forwardRef<
  ElementRef<typeof BaseContextMenu.CheckboxItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItemIndicator>
>(function ContextMenuCheckboxItemIndicator({ className, ...props }, ref) {
  return (
    <BaseContextMenu.CheckboxItemIndicator
      ref={ref}
      className={withBaseClassName(styles.CheckboxIndicator, className)}
      {...props}
    />
  );
});

const ContextMenuRadioItem = forwardRef<
  ElementRef<typeof BaseContextMenu.RadioItem>,
  ContextMenuRadioItemProps
>(function ContextMenuRadioItem(
  { className, variant, color, size, children, startDecorator, endDecorator, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.RadioItem
      ref={ref}
      className={withBaseClassName(styles.RadioItem, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {renderDecoratedContent({ children, startDecorator, endDecorator })}
    </BaseContextMenu.RadioItem>
  );
});

const ContextMenuRadioItemIndicator = forwardRef<
  ElementRef<typeof BaseContextMenu.RadioItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItemIndicator>
>(function ContextMenuRadioItemIndicator({ className, ...props }, ref) {
  return (
    <BaseContextMenu.RadioItemIndicator
      ref={ref}
      className={withBaseClassName(styles.RadioIndicator, className)}
      {...props}
    />
  );
});

const ContextMenuSubmenuTrigger = forwardRef<
  ElementRef<typeof BaseContextMenu.SubmenuTrigger>,
  ContextMenuSubmenuTriggerProps
>(function ContextMenuSubmenuTrigger(
  {
    className,
    variant,
    color,
    size,
    children,
    startDecorator,
    endDecorator,
    showCaret = true,
    ...props
  },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      className={withBaseClassName(styles.SubmenuTrigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {startDecorator ? <span className={styles.StartDecorator}>{startDecorator}</span> : null}
      {children}
      {endDecorator ? <span className={styles.EndDecorator}>{endDecorator}</span> : null}
      {showCaret ? <span className={styles.SubmenuCaret}>›</span> : null}
    </BaseContextMenu.SubmenuTrigger>
  );
});

ContextMenuRoot.displayName = 'ContextMenu.Root';
ContextMenuTrigger.displayName = 'ContextMenu.Trigger';
ContextMenuBackdrop.displayName = 'ContextMenu.Backdrop';
ContextMenuPositioner.displayName = 'ContextMenu.Positioner';
ContextMenuPopup.displayName = 'ContextMenu.Popup';
ContextMenuGroupLabel.displayName = 'ContextMenu.GroupLabel';
ContextMenuSeparator.displayName = 'ContextMenu.Separator';
ContextMenuItem.displayName = 'ContextMenu.Item';
ContextMenuLinkItem.displayName = 'ContextMenu.LinkItem';
ContextMenuCheckboxItem.displayName = 'ContextMenu.CheckboxItem';
ContextMenuCheckboxItemIndicator.displayName = 'ContextMenu.CheckboxItemIndicator';
ContextMenuRadioItem.displayName = 'ContextMenu.RadioItem';
ContextMenuRadioItemIndicator.displayName = 'ContextMenu.RadioItemIndicator';
ContextMenuSubmenuTrigger.displayName = 'ContextMenu.SubmenuTrigger';

type ContextMenuCompound = typeof ContextMenuRoot & {
  Root: typeof ContextMenuRoot;
  Trigger: typeof ContextMenuTrigger;
  Portal: typeof BaseContextMenu.Portal;
  Backdrop: typeof ContextMenuBackdrop;
  Positioner: typeof ContextMenuPositioner;
  Popup: typeof ContextMenuPopup;
  Arrow: typeof BaseContextMenu.Arrow;
  Group: typeof BaseContextMenu.Group;
  GroupLabel: typeof ContextMenuGroupLabel;
  Item: typeof ContextMenuItem;
  LinkItem: typeof ContextMenuLinkItem;
  CheckboxItem: typeof ContextMenuCheckboxItem;
  CheckboxItemIndicator: typeof ContextMenuCheckboxItemIndicator;
  RadioGroup: typeof BaseContextMenu.RadioGroup;
  RadioItem: typeof ContextMenuRadioItem;
  RadioItemIndicator: typeof ContextMenuRadioItemIndicator;
  SubmenuRoot: typeof BaseContextMenu.SubmenuRoot;
  SubmenuTrigger: typeof ContextMenuSubmenuTrigger;
  Separator: typeof ContextMenuSeparator;
};

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: BaseContextMenu.Portal,
  Backdrop: ContextMenuBackdrop,
  Positioner: ContextMenuPositioner,
  Popup: ContextMenuPopup,
  Arrow: BaseContextMenu.Arrow,
  Group: BaseContextMenu.Group,
  GroupLabel: ContextMenuGroupLabel,
  Item: ContextMenuItem,
  LinkItem: ContextMenuLinkItem,
  CheckboxItem: ContextMenuCheckboxItem,
  CheckboxItemIndicator: ContextMenuCheckboxItemIndicator,
  RadioGroup: BaseContextMenu.RadioGroup,
  RadioItem: ContextMenuRadioItem,
  RadioItemIndicator: ContextMenuRadioItemIndicator,
  SubmenuRoot: BaseContextMenu.SubmenuRoot,
  SubmenuTrigger: ContextMenuSubmenuTrigger,
  Separator: ContextMenuSeparator,
}) as ContextMenuCompound;
