import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
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
import styles from './Combobox.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const ComboboxStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(ComboboxStyleContext);
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

export type ComboboxRootProps<Value = unknown, Multiple extends boolean | undefined = false> = Omit<
  BaseCombobox.Root.Props<Value, Multiple>,
  'color'
> &
  StyledComponentProps;

export interface ComboboxInputProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Input>, 'color' | 'size'>,
    StyledComponentProps {}

export interface ComboboxPopupProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Popup>, 'color'>,
    StyledComponentProps {}

export interface ComboboxListProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCombobox.List>, 'color'>, StyledComponentProps {}

export interface ComboboxItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Item>, 'color' | 'children'>,
    StyledComponentProps,
    DecoratedContentProps {}

export interface ComboboxTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Trigger>, 'color'>,
    StyledComponentProps {}

export interface ComboboxClearProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Clear>, 'color'>,
    StyledComponentProps {}

export interface ComboboxChipProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Chip>, 'color'>, StyledComponentProps {}

export interface ComboboxChipRemoveProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCombobox.ChipRemove>, 'color'>,
    StyledComponentProps {}

function ComboboxRoot<Value, Multiple extends boolean | undefined = false>({
  variant,
  color,
  size,
  ...props
}: ComboboxRootProps<Value, Multiple>) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <ComboboxStyleContext.Provider value={resolved}>
      <BaseCombobox.Root<Value, Multiple> {...props} />
    </ComboboxStyleContext.Provider>
  );
}

const ComboboxInput = forwardRef<ElementRef<typeof BaseCombobox.Input>, ComboboxInputProps>(
  function ComboboxInput({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Input
        ref={ref}
        className={withBaseClassName(styles.Input, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxTrigger = forwardRef<ElementRef<typeof BaseCombobox.Trigger>, ComboboxTriggerProps>(
  function ComboboxTrigger({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Trigger
        ref={ref}
        className={withBaseClassName(styles.Trigger, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxClear = forwardRef<ElementRef<typeof BaseCombobox.Clear>, ComboboxClearProps>(
  function ComboboxClear({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Clear
        ref={ref}
        className={withBaseClassName(styles.Clear, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxPositioner = forwardRef<
  ElementRef<typeof BaseCombobox.Positioner>,
  ComponentPropsWithoutRef<typeof BaseCombobox.Positioner>
>(function ComboboxPositioner({ className, ...props }, ref) {
  return (
    <BaseCombobox.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const ComboboxPopup = forwardRef<ElementRef<typeof BaseCombobox.Popup>, ComboboxPopupProps>(
  function ComboboxPopup({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Popup
        ref={ref}
        className={withBaseClassName(styles.Popup, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxList = forwardRef<ElementRef<typeof BaseCombobox.List>, ComboboxListProps>(
  function ComboboxList({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.List
        ref={ref}
        className={withBaseClassName(styles.List, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxItem = forwardRef<ElementRef<typeof BaseCombobox.Item>, ComboboxItemProps>(
  function ComboboxItem(
    { className, variant, color, size, children, startDecorator, endDecorator, ...props },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Item
        ref={ref}
        className={withBaseClassName(styles.Item, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {renderDecoratedContent({ children, startDecorator, endDecorator })}
      </BaseCombobox.Item>
    );
  },
);

const ComboboxItemIndicator = forwardRef<
  ElementRef<typeof BaseCombobox.ItemIndicator>,
  ComponentPropsWithoutRef<typeof BaseCombobox.ItemIndicator>
>(function ComboboxItemIndicator({ className, ...props }, ref) {
  return (
    <BaseCombobox.ItemIndicator
      ref={ref}
      className={withBaseClassName(styles.ItemIndicator, className)}
      {...props}
    />
  );
});

const ComboboxEmpty = forwardRef<
  ElementRef<typeof BaseCombobox.Empty>,
  ComponentPropsWithoutRef<typeof BaseCombobox.Empty>
>(function ComboboxEmpty({ className, ...props }, ref) {
  return (
    <BaseCombobox.Empty
      ref={ref}
      className={withBaseClassName(styles.Empty, className)}
      {...props}
    />
  );
});

const ComboboxGroupLabel = forwardRef<
  ElementRef<typeof BaseCombobox.GroupLabel>,
  ComponentPropsWithoutRef<typeof BaseCombobox.GroupLabel>
>(function ComboboxGroupLabel({ className, ...props }, ref) {
  return (
    <BaseCombobox.GroupLabel
      ref={ref}
      className={withBaseClassName(styles.GroupLabel, className)}
      {...props}
    />
  );
});

const ComboboxSeparator = forwardRef<
  ElementRef<typeof BaseCombobox.Separator>,
  ComponentPropsWithoutRef<typeof BaseCombobox.Separator>
>(function ComboboxSeparator({ className, ...props }, ref) {
  return (
    <BaseCombobox.Separator
      ref={ref}
      className={withBaseClassName(styles.Separator, className)}
      {...props}
    />
  );
});

const ComboboxChips = forwardRef<
  ElementRef<typeof BaseCombobox.Chips>,
  ComponentPropsWithoutRef<typeof BaseCombobox.Chips>
>(function ComboboxChips({ className, ...props }, ref) {
  return (
    <BaseCombobox.Chips
      ref={ref}
      className={withBaseClassName(styles.Chips, className)}
      {...props}
    />
  );
});

const ComboboxChip = forwardRef<ElementRef<typeof BaseCombobox.Chip>, ComboboxChipProps>(
  function ComboboxChip({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseCombobox.Chip
        ref={ref}
        className={withBaseClassName(styles.Chip, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const ComboboxChipRemove = forwardRef<
  ElementRef<typeof BaseCombobox.ChipRemove>,
  ComboboxChipRemoveProps
>(function ComboboxChipRemove({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseCombobox.ChipRemove
      ref={ref}
      className={withBaseClassName(styles.ChipRemove, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

ComboboxRoot.displayName = 'Combobox.Root';
ComboboxInput.displayName = 'Combobox.Input';
ComboboxTrigger.displayName = 'Combobox.Trigger';
ComboboxClear.displayName = 'Combobox.Clear';
ComboboxPositioner.displayName = 'Combobox.Positioner';
ComboboxPopup.displayName = 'Combobox.Popup';
ComboboxList.displayName = 'Combobox.List';
ComboboxItem.displayName = 'Combobox.Item';
ComboboxItemIndicator.displayName = 'Combobox.ItemIndicator';
ComboboxEmpty.displayName = 'Combobox.Empty';
ComboboxGroupLabel.displayName = 'Combobox.GroupLabel';
ComboboxSeparator.displayName = 'Combobox.Separator';
ComboboxChips.displayName = 'Combobox.Chips';
ComboboxChip.displayName = 'Combobox.Chip';
ComboboxChipRemove.displayName = 'Combobox.ChipRemove';

type ComboboxCompound = typeof ComboboxRoot & {
  Root: typeof ComboboxRoot;
  Value: typeof BaseCombobox.Value;
  Input: typeof ComboboxInput;
  Trigger: typeof ComboboxTrigger;
  List: typeof ComboboxList;
  Status: typeof BaseCombobox.Status;
  Portal: typeof BaseCombobox.Portal;
  Backdrop: typeof BaseCombobox.Backdrop;
  Positioner: typeof ComboboxPositioner;
  Popup: typeof ComboboxPopup;
  Arrow: typeof BaseCombobox.Arrow;
  Icon: typeof BaseCombobox.Icon;
  Group: typeof BaseCombobox.Group;
  GroupLabel: typeof ComboboxGroupLabel;
  Item: typeof ComboboxItem;
  ItemIndicator: typeof ComboboxItemIndicator;
  Chips: typeof ComboboxChips;
  Chip: typeof ComboboxChip;
  ChipRemove: typeof ComboboxChipRemove;
  Row: typeof BaseCombobox.Row;
  Collection: typeof BaseCombobox.Collection;
  Empty: typeof ComboboxEmpty;
  Clear: typeof ComboboxClear;
  Separator: typeof ComboboxSeparator;
  useFilter: typeof BaseCombobox.useFilter;
  useFilteredItems: typeof BaseCombobox.useFilteredItems;
};

export const Combobox = Object.assign(ComboboxRoot, {
  Root: ComboboxRoot,
  Value: BaseCombobox.Value,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  List: ComboboxList,
  Status: BaseCombobox.Status,
  Portal: BaseCombobox.Portal,
  Backdrop: BaseCombobox.Backdrop,
  Positioner: ComboboxPositioner,
  Popup: ComboboxPopup,
  Arrow: BaseCombobox.Arrow,
  Icon: BaseCombobox.Icon,
  Group: BaseCombobox.Group,
  GroupLabel: ComboboxGroupLabel,
  Item: ComboboxItem,
  ItemIndicator: ComboboxItemIndicator,
  Chips: ComboboxChips,
  Chip: ComboboxChip,
  ChipRemove: ComboboxChipRemove,
  Row: BaseCombobox.Row,
  Collection: BaseCombobox.Collection,
  Empty: ComboboxEmpty,
  Clear: ComboboxClear,
  Separator: ComboboxSeparator,
  useFilter: BaseCombobox.useFilter,
  useFilteredItems: BaseCombobox.useFilteredItems,
}) as ComboboxCompound;
