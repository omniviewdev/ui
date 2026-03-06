import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './Autocomplete.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const AutocompleteStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(AutocompleteStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface AutocompleteRootProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Root>, 'color'>,
    StyledComponentProps {}

export interface AutocompleteInputProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Input>, 'color' | 'size'>,
    StyledComponentProps {}

export interface AutocompletePopupProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Popup>, 'color'>,
    StyledComponentProps {}

export interface AutocompleteListProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.List>, 'color'>,
    StyledComponentProps {}

export interface AutocompleteItemProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Item>, 'color'>,
    StyledComponentProps {}

export interface AutocompleteTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Trigger>, 'color'>,
    StyledComponentProps {}

export interface AutocompleteClearProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAutocomplete.Clear>, 'color'>,
    StyledComponentProps {}

const AutocompleteRoot = ({ variant, color, size, ...props }: AutocompleteRootProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <AutocompleteStyleContext.Provider value={resolved}>
      <BaseAutocomplete.Root {...props} />
    </AutocompleteStyleContext.Provider>
  );
};

const AutocompleteInput = forwardRef<
  ElementRef<typeof BaseAutocomplete.Input>,
  AutocompleteInputProps
>(function AutocompleteInput({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.Input
      ref={ref}
      className={withBaseClassName(styles.Input, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompleteTrigger = forwardRef<
  ElementRef<typeof BaseAutocomplete.Trigger>,
  AutocompleteTriggerProps
>(function AutocompleteTrigger({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.Trigger
      ref={ref}
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompleteClear = forwardRef<
  ElementRef<typeof BaseAutocomplete.Clear>,
  AutocompleteClearProps
>(function AutocompleteClear({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.Clear
      ref={ref}
      className={withBaseClassName(styles.Clear, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompletePositioner = forwardRef<
  ElementRef<typeof BaseAutocomplete.Positioner>,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Positioner>
>(function AutocompletePositioner({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const AutocompletePopup = forwardRef<
  ElementRef<typeof BaseAutocomplete.Popup>,
  AutocompletePopupProps
>(function AutocompletePopup({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.Popup
      ref={ref}
      className={withBaseClassName(styles.Popup, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompleteList = forwardRef<
  ElementRef<typeof BaseAutocomplete.List>,
  AutocompleteListProps
>(function AutocompleteList({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.List
      ref={ref}
      className={withBaseClassName(styles.List, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompleteItem = forwardRef<
  ElementRef<typeof BaseAutocomplete.Item>,
  AutocompleteItemProps
>(function AutocompleteItem({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAutocomplete.Item
      ref={ref}
      className={withBaseClassName(styles.Item, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AutocompleteEmpty = forwardRef<
  ElementRef<typeof BaseAutocomplete.Empty>,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Empty>
>(function AutocompleteEmpty({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Empty
      ref={ref}
      className={withBaseClassName(styles.Empty, className)}
      {...props}
    />
  );
});

const AutocompleteGroupLabel = forwardRef<
  ElementRef<typeof BaseAutocomplete.GroupLabel>,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.GroupLabel>
>(function AutocompleteGroupLabel({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.GroupLabel
      ref={ref}
      className={withBaseClassName(styles.GroupLabel, className)}
      {...props}
    />
  );
});

const AutocompleteSeparator = forwardRef<
  ElementRef<typeof BaseAutocomplete.Separator>,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Separator>
>(function AutocompleteSeparator({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Separator
      ref={ref}
      className={withBaseClassName(styles.Separator, className)}
      {...props}
    />
  );
});

AutocompleteRoot.displayName = 'Autocomplete.Root';
AutocompleteInput.displayName = 'Autocomplete.Input';
AutocompleteTrigger.displayName = 'Autocomplete.Trigger';
AutocompleteClear.displayName = 'Autocomplete.Clear';
AutocompletePositioner.displayName = 'Autocomplete.Positioner';
AutocompletePopup.displayName = 'Autocomplete.Popup';
AutocompleteList.displayName = 'Autocomplete.List';
AutocompleteItem.displayName = 'Autocomplete.Item';
AutocompleteEmpty.displayName = 'Autocomplete.Empty';
AutocompleteGroupLabel.displayName = 'Autocomplete.GroupLabel';
AutocompleteSeparator.displayName = 'Autocomplete.Separator';

type AutocompleteCompound = typeof AutocompleteRoot & {
  Root: typeof AutocompleteRoot;
  Arrow: typeof BaseAutocomplete.Arrow;
  Backdrop: typeof BaseAutocomplete.Backdrop;
  Clear: typeof AutocompleteClear;
  Collection: typeof BaseAutocomplete.Collection;
  Empty: typeof AutocompleteEmpty;
  Group: typeof BaseAutocomplete.Group;
  GroupLabel: typeof AutocompleteGroupLabel;
  Icon: typeof BaseAutocomplete.Icon;
  Input: typeof AutocompleteInput;
  Item: typeof AutocompleteItem;
  List: typeof AutocompleteList;
  Popup: typeof AutocompletePopup;
  Portal: typeof BaseAutocomplete.Portal;
  Positioner: typeof AutocompletePositioner;
  Row: typeof BaseAutocomplete.Row;
  Separator: typeof AutocompleteSeparator;
  Status: typeof BaseAutocomplete.Status;
  Trigger: typeof AutocompleteTrigger;
  Value: typeof BaseAutocomplete.Value;
  useFilter: typeof BaseAutocomplete.useFilter;
  useFilteredItems: typeof BaseAutocomplete.useFilteredItems;
};

export const Autocomplete = Object.assign(AutocompleteRoot, {
  Root: AutocompleteRoot,
  Arrow: BaseAutocomplete.Arrow,
  Backdrop: BaseAutocomplete.Backdrop,
  Clear: AutocompleteClear,
  Collection: BaseAutocomplete.Collection,
  Empty: AutocompleteEmpty,
  Group: BaseAutocomplete.Group,
  GroupLabel: AutocompleteGroupLabel,
  Icon: BaseAutocomplete.Icon,
  Input: AutocompleteInput,
  Item: AutocompleteItem,
  List: AutocompleteList,
  Popup: AutocompletePopup,
  Portal: BaseAutocomplete.Portal,
  Positioner: AutocompletePositioner,
  Row: BaseAutocomplete.Row,
  Separator: AutocompleteSeparator,
  Status: BaseAutocomplete.Status,
  Trigger: AutocompleteTrigger,
  Value: BaseAutocomplete.Value,
  useFilter: BaseAutocomplete.useFilter,
  useFilteredItems: BaseAutocomplete.useFilteredItems,
}) as AutocompleteCompound;
