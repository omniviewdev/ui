import { Menu as BaseMenu } from '@base-ui/react/menu';
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
import styles from './Menu.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const MenuStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(MenuStyleContext);
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

export interface MenuRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseMenu.Root>, 'color'>, StyledComponentProps {}

export interface MenuTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseMenu.Trigger>, 'color'>, StyledComponentProps {}

export interface MenuPopupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseMenu.Popup>, 'color'>, StyledComponentProps {}

export interface MenuItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseMenu.Item>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface MenuLinkItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseMenu.LinkItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface MenuCheckboxItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface MenuRadioItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface MenuSubmenuTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {
  showCaret?: boolean;
}

const MenuRoot = ({ variant, color, size, ...props }: MenuRootProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <MenuStyleContext.Provider value={resolved}>
      <BaseMenu.Root {...props} />
    </MenuStyleContext.Provider>
  );
};

const MenuTrigger = ({ className, variant, color, size, ...props }: MenuTriggerProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.Trigger
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
};

const MenuBackdrop = forwardRef<
  ElementRef<typeof BaseMenu.Backdrop>,
  ComponentPropsWithoutRef<typeof BaseMenu.Backdrop>
>(function MenuBackdrop({ className, ...props }, ref) {
  return (
    <BaseMenu.Backdrop
      ref={ref}
      className={withBaseClassName(styles.Backdrop, className)}
      {...props}
    />
  );
});

const MenuPositioner = forwardRef<
  ElementRef<typeof BaseMenu.Positioner>,
  ComponentPropsWithoutRef<typeof BaseMenu.Positioner>
>(function MenuPositioner({ className, ...props }, ref) {
  return (
    <BaseMenu.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const MenuPopup = forwardRef<ElementRef<typeof BaseMenu.Popup>, MenuPopupProps>(function MenuPopup(
  { className, variant, color, size, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.Popup
      ref={ref}
      className={withBaseClassName(styles.Popup, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const MenuGroupLabel = forwardRef<
  ElementRef<typeof BaseMenu.GroupLabel>,
  Omit<ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>, 'color'> & StyledComponentProps
>(function MenuGroupLabel({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      className={withBaseClassName(styles.GroupLabel, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const MenuSeparator = forwardRef<
  ElementRef<typeof BaseMenu.Separator>,
  Omit<ComponentPropsWithoutRef<typeof BaseMenu.Separator>, 'color'> & StyledComponentProps
>(function MenuSeparator({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.Separator
      ref={ref}
      className={withBaseClassName(styles.Separator, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const MenuItem = forwardRef<ElementRef<typeof BaseMenu.Item>, MenuItemProps>(function MenuItem(
  { className, variant, color, size, children, startDecorator, endDecorator, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.Item
      ref={ref}
      className={withBaseClassName(styles.Item, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {renderDecoratedContent({ children, startDecorator, endDecorator })}
    </BaseMenu.Item>
  );
});

const MenuLinkItem = forwardRef<ElementRef<typeof BaseMenu.LinkItem>, MenuLinkItemProps>(
  function MenuLinkItem(
    { className, variant, color, size, children, startDecorator, endDecorator, ...props },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseMenu.LinkItem
        ref={ref}
        className={withBaseClassName(styles.LinkItem, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({ children, startDecorator, endDecorator })}
      </BaseMenu.LinkItem>
    );
  },
);

const MenuCheckboxItem = forwardRef<
  ElementRef<typeof BaseMenu.CheckboxItem>,
  MenuCheckboxItemProps
>(function MenuCheckboxItem(
  { className, variant, color, size, children, startDecorator, endDecorator, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseMenu.CheckboxItem
      ref={ref}
      className={withBaseClassName(styles.CheckboxItem, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {renderDecoratedContent({ children, startDecorator, endDecorator })}
    </BaseMenu.CheckboxItem>
  );
});

const MenuCheckboxItemIndicator = forwardRef<
  ElementRef<typeof BaseMenu.CheckboxItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItemIndicator>
>(function MenuCheckboxItemIndicator({ className, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItemIndicator
      ref={ref}
      className={withBaseClassName(styles.CheckboxIndicator, className)}
      {...props}
    />
  );
});

const MenuRadioItem = forwardRef<ElementRef<typeof BaseMenu.RadioItem>, MenuRadioItemProps>(
  function MenuRadioItem(
    { className, variant, color, size, children, startDecorator, endDecorator, ...props },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseMenu.RadioItem
        ref={ref}
        className={withBaseClassName(styles.RadioItem, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({ children, startDecorator, endDecorator })}
      </BaseMenu.RadioItem>
    );
  },
);

const MenuRadioItemIndicator = forwardRef<
  ElementRef<typeof BaseMenu.RadioItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseMenu.RadioItemIndicator>
>(function MenuRadioItemIndicator({ className, ...props }, ref) {
  return (
    <BaseMenu.RadioItemIndicator
      ref={ref}
      className={withBaseClassName(styles.RadioIndicator, className)}
      {...props}
    />
  );
});

const MenuSubmenuTrigger = forwardRef<
  ElementRef<typeof BaseMenu.SubmenuTrigger>,
  MenuSubmenuTriggerProps
>(function MenuSubmenuTrigger(
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
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={withBaseClassName(styles.SubmenuTrigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {startDecorator ? <span className={styles.StartDecorator}>{startDecorator}</span> : null}
      {children}
      {endDecorator ? <span className={styles.EndDecorator}>{endDecorator}</span> : null}
      {showCaret ? <span className={styles.SubmenuCaret}>›</span> : null}
    </BaseMenu.SubmenuTrigger>
  );
});

MenuRoot.displayName = 'Menu.Root';
MenuTrigger.displayName = 'Menu.Trigger';
MenuBackdrop.displayName = 'Menu.Backdrop';
MenuPositioner.displayName = 'Menu.Positioner';
MenuPopup.displayName = 'Menu.Popup';
MenuGroupLabel.displayName = 'Menu.GroupLabel';
MenuSeparator.displayName = 'Menu.Separator';
MenuItem.displayName = 'Menu.Item';
MenuLinkItem.displayName = 'Menu.LinkItem';
MenuCheckboxItem.displayName = 'Menu.CheckboxItem';
MenuCheckboxItemIndicator.displayName = 'Menu.CheckboxItemIndicator';
MenuRadioItem.displayName = 'Menu.RadioItem';
MenuRadioItemIndicator.displayName = 'Menu.RadioItemIndicator';
MenuSubmenuTrigger.displayName = 'Menu.SubmenuTrigger';

type MenuCompound = typeof MenuRoot & {
  Root: typeof MenuRoot;
  Trigger: typeof MenuTrigger;
  Portal: typeof BaseMenu.Portal;
  Backdrop: typeof MenuBackdrop;
  Positioner: typeof MenuPositioner;
  Popup: typeof MenuPopup;
  Arrow: typeof BaseMenu.Arrow;
  Group: typeof BaseMenu.Group;
  GroupLabel: typeof MenuGroupLabel;
  Item: typeof MenuItem;
  LinkItem: typeof MenuLinkItem;
  CheckboxItem: typeof MenuCheckboxItem;
  CheckboxItemIndicator: typeof MenuCheckboxItemIndicator;
  RadioGroup: typeof BaseMenu.RadioGroup;
  RadioItem: typeof MenuRadioItem;
  RadioItemIndicator: typeof MenuRadioItemIndicator;
  SubmenuRoot: typeof BaseMenu.SubmenuRoot;
  SubmenuTrigger: typeof MenuSubmenuTrigger;
  Separator: typeof MenuSeparator;
  Handle: typeof BaseMenu.Handle;
  createHandle: typeof BaseMenu.createHandle;
};

export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: BaseMenu.Portal,
  Backdrop: MenuBackdrop,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Arrow: BaseMenu.Arrow,
  Group: BaseMenu.Group,
  GroupLabel: MenuGroupLabel,
  Item: MenuItem,
  LinkItem: MenuLinkItem,
  CheckboxItem: MenuCheckboxItem,
  CheckboxItemIndicator: MenuCheckboxItemIndicator,
  RadioGroup: BaseMenu.RadioGroup,
  RadioItem: MenuRadioItem,
  RadioItemIndicator: MenuRadioItemIndicator,
  SubmenuRoot: BaseMenu.SubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Separator: MenuSeparator,
  Handle: BaseMenu.Handle,
  createHandle: BaseMenu.createHandle,
}) as MenuCompound;
