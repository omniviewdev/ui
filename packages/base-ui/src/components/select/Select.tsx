import { Select as BaseSelect } from '@base-ui/react/select';
import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
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
import styles from './Select.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;
type SelectionIndicatorMode = 'auto' | 'always' | 'never';

interface SelectContextValue extends ResolvedStyleProps {
  showSelectionIndicator: boolean;
}

const SelectStyleContext = createContext<SelectContextValue>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
  showSelectionIndicator: false,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): SelectContextValue {
  const inherited = useContext(SelectStyleContext);

  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
    showSelectionIndicator: inherited.showSelectionIndicator,
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

export type SelectRootProps<Value, Multiple extends boolean | undefined = false> = Omit<
  BaseSelect.Root.Props<Value, Multiple>,
  'color'
> &
  StyledComponentProps & {
    selectionIndicator?: SelectionIndicatorMode;
  };

export interface SelectTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, 'color'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface SelectValueProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Value>, 'color'>, StyledComponentProps {}

export interface SelectIconProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Icon>, 'color'>, StyledComponentProps {}

export interface SelectPopupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Popup>, 'color'>, StyledComponentProps {}

export interface SelectListProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.List>, 'color'>, StyledComponentProps {}

export interface SelectItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseSelect.Item>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {
  selectionIndicator?: boolean;
}

function SelectRoot<Value, Multiple extends boolean | undefined = false>({
  variant,
  color,
  size,
  selectionIndicator = 'auto',
  multiple,
  ...props
}: SelectRootProps<Value, Multiple>) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  const showSelectionIndicator =
    selectionIndicator === 'always'
      ? true
      : selectionIndicator === 'never'
        ? false
        : Boolean(multiple);

  const contextValue = useMemo(
    () => ({ ...resolved, showSelectionIndicator }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolved.variant, resolved.color, resolved.size, showSelectionIndicator],
  );

  return (
    <SelectStyleContext.Provider value={contextValue}>
      <BaseSelect.Root<Value, Multiple> multiple={multiple} {...props} />
    </SelectStyleContext.Provider>
  );
}

const SelectTrigger = forwardRef<ElementRef<typeof BaseSelect.Trigger>, SelectTriggerProps>(
  function SelectTrigger(
    { className, variant, color, size, children, startDecorator, endDecorator, ...props },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSelect.Trigger
        ref={ref}
        className={withBaseClassName<BaseSelect.Trigger.State>(styles.Trigger, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({ children, startDecorator, endDecorator })}
      </BaseSelect.Trigger>
    );
  },
);

const SelectValue = forwardRef<ElementRef<typeof BaseSelect.Value>, SelectValueProps>(
  function SelectValue({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSelect.Value
        ref={ref}
        className={withBaseClassName<BaseSelect.Value.State>(styles.Value, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SelectIcon = forwardRef<ElementRef<typeof BaseSelect.Icon>, SelectIconProps>(
  function SelectIcon({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSelect.Icon
        ref={ref}
        className={withBaseClassName<BaseSelect.Icon.State>(styles.Icon, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SelectBackdrop = forwardRef<
  ElementRef<typeof BaseSelect.Backdrop>,
  ComponentPropsWithoutRef<typeof BaseSelect.Backdrop>
>(function SelectBackdrop({ className, ...props }, ref) {
  return (
    <BaseSelect.Backdrop
      ref={ref}
      className={withBaseClassName<BaseSelect.Backdrop.State>(styles.Backdrop, className)}
      {...props}
    />
  );
});

const SelectPositioner = forwardRef<
  ElementRef<typeof BaseSelect.Positioner>,
  ComponentPropsWithoutRef<typeof BaseSelect.Positioner>
>(function SelectPositioner(
  { className, alignItemWithTrigger = false, side = 'bottom', align = 'start', ...props },
  ref,
) {
  return (
    <BaseSelect.Positioner
      ref={ref}
      className={withBaseClassName<BaseSelect.Positioner.State>(styles.Positioner, className)}
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
      side={side}
      {...props}
    />
  );
});

const SelectPopup = forwardRef<ElementRef<typeof BaseSelect.Popup>, SelectPopupProps>(
  function SelectPopup({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSelect.Popup
        ref={ref}
        className={withBaseClassName<BaseSelect.Popup.State>(styles.Popup, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SelectArrow = forwardRef<
  ElementRef<typeof BaseSelect.Arrow>,
  ComponentPropsWithoutRef<typeof BaseSelect.Arrow>
>(function SelectArrow({ className, ...props }, ref) {
  return (
    <BaseSelect.Arrow
      ref={ref}
      className={withBaseClassName<BaseSelect.Arrow.State>(styles.Arrow, className)}
      {...props}
    />
  );
});

const SelectScrollUpArrow = forwardRef<
  ElementRef<typeof BaseSelect.ScrollUpArrow>,
  ComponentPropsWithoutRef<typeof BaseSelect.ScrollUpArrow>
>(function SelectScrollUpArrow({ className, ...props }, ref) {
  return (
    <BaseSelect.ScrollUpArrow
      ref={ref}
      className={withBaseClassName<BaseSelect.ScrollUpArrow.State>(styles.ScrollArrow, className)}
      {...props}
    />
  );
});

const SelectScrollDownArrow = forwardRef<
  ElementRef<typeof BaseSelect.ScrollDownArrow>,
  ComponentPropsWithoutRef<typeof BaseSelect.ScrollDownArrow>
>(function SelectScrollDownArrow({ className, ...props }, ref) {
  return (
    <BaseSelect.ScrollDownArrow
      ref={ref}
      className={withBaseClassName<BaseSelect.ScrollDownArrow.State>(styles.ScrollArrow, className)}
      {...props}
    />
  );
});

const SelectList = forwardRef<ElementRef<typeof BaseSelect.List>, SelectListProps>(
  function SelectList({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSelect.List
        ref={ref}
        className={withBaseClassName<BaseSelect.List.State>(styles.List, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SelectGroupLabel = forwardRef<
  ElementRef<typeof BaseSelect.GroupLabel>,
  Omit<ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>, 'color'> & StyledComponentProps
>(function SelectGroupLabel({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseSelect.GroupLabel
      ref={ref}
      className={withBaseClassName<BaseSelect.GroupLabel.State>(styles.GroupLabel, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const SelectItem = forwardRef<ElementRef<typeof BaseSelect.Item>, SelectItemProps>(
  function SelectItem(
    {
      className,
      variant,
      color,
      size,
      children,
      startDecorator,
      endDecorator,
      selectionIndicator,
      ...props
    },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    const shouldShowSelectionIndicator =
      selectionIndicator ?? (startDecorator ? false : resolved.showSelectionIndicator);

    const itemStartDecorator = shouldShowSelectionIndicator ? (
      <BaseSelect.ItemIndicator className={styles.ItemIndicator} keepMounted>
        <span className={styles.ItemIndicatorGlyph} aria-hidden>
          ✓
        </span>
      </BaseSelect.ItemIndicator>
    ) : (
      startDecorator
    );

    return (
      <BaseSelect.Item
        ref={ref}
        className={withBaseClassName<BaseSelect.Item.State>(styles.Item, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({
          children,
          startDecorator: itemStartDecorator,
          endDecorator,
        })}
      </BaseSelect.Item>
    );
  },
);

const SelectItemIndicator = forwardRef<
  ElementRef<typeof BaseSelect.ItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseSelect.ItemIndicator>
>(function SelectItemIndicator({ className, ...props }, ref) {
  return (
    <BaseSelect.ItemIndicator
      ref={ref}
      className={withBaseClassName<BaseSelect.ItemIndicator.State>(styles.ItemIndicator, className)}
      {...props}
    />
  );
});

const SelectItemText = forwardRef<
  ElementRef<typeof BaseSelect.ItemText>,
  ComponentPropsWithoutRef<typeof BaseSelect.ItemText>
>(function SelectItemText({ className, ...props }, ref) {
  return (
    <BaseSelect.ItemText
      ref={ref}
      className={withBaseClassName<BaseSelect.ItemText.State>(styles.ItemText, className)}
      {...props}
    />
  );
});

const SelectSeparator = forwardRef<
  ElementRef<typeof BaseSelect.Separator>,
  Omit<ComponentPropsWithoutRef<typeof BaseSelect.Separator>, 'color'> & StyledComponentProps
>(function SelectSeparator({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseSelect.Separator
      ref={ref}
      className={withBaseClassName(styles.Separator, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

SelectRoot.displayName = 'Select.Root';
SelectTrigger.displayName = 'Select.Trigger';
SelectValue.displayName = 'Select.Value';
SelectIcon.displayName = 'Select.Icon';
SelectBackdrop.displayName = 'Select.Backdrop';
SelectPositioner.displayName = 'Select.Positioner';
SelectPopup.displayName = 'Select.Popup';
SelectArrow.displayName = 'Select.Arrow';
SelectScrollUpArrow.displayName = 'Select.ScrollUpArrow';
SelectScrollDownArrow.displayName = 'Select.ScrollDownArrow';
SelectList.displayName = 'Select.List';
SelectGroupLabel.displayName = 'Select.GroupLabel';
SelectItem.displayName = 'Select.Item';
SelectItemIndicator.displayName = 'Select.ItemIndicator';
SelectItemText.displayName = 'Select.ItemText';
SelectSeparator.displayName = 'Select.Separator';

type SelectCompound = typeof SelectRoot & {
  Root: typeof SelectRoot;
  Trigger: typeof SelectTrigger;
  Value: typeof SelectValue;
  Icon: typeof SelectIcon;
  Portal: typeof BaseSelect.Portal;
  Backdrop: typeof SelectBackdrop;
  Positioner: typeof SelectPositioner;
  Popup: typeof SelectPopup;
  Arrow: typeof SelectArrow;
  ScrollUpArrow: typeof SelectScrollUpArrow;
  ScrollDownArrow: typeof SelectScrollDownArrow;
  List: typeof SelectList;
  Group: typeof BaseSelect.Group;
  GroupLabel: typeof SelectGroupLabel;
  Item: typeof SelectItem;
  ItemIndicator: typeof SelectItemIndicator;
  ItemText: typeof SelectItemText;
  Separator: typeof SelectSeparator;
};

export const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: BaseSelect.Portal,
  Backdrop: SelectBackdrop,
  Positioner: SelectPositioner,
  Popup: SelectPopup,
  Arrow: SelectArrow,
  ScrollUpArrow: SelectScrollUpArrow,
  ScrollDownArrow: SelectScrollDownArrow,
  List: SelectList,
  Group: BaseSelect.Group,
  GroupLabel: SelectGroupLabel,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  Separator: SelectSeparator,
}) as SelectCompound;
