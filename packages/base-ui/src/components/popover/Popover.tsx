import { Popover as BasePopover } from '@base-ui/react/popover';
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
import styles from './Popover.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const PopoverStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(PopoverStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export type PopoverRootProps<Payload = unknown> = Omit<BasePopover.Root.Props<Payload>, 'color'> &
  StyledComponentProps;

export interface PopoverTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BasePopover.Trigger>, 'color'>,
    StyledComponentProps {}

export interface PopoverPopupProps
  extends Omit<ComponentPropsWithoutRef<typeof BasePopover.Popup>, 'color'>, StyledComponentProps {}

export interface PopoverCloseProps
  extends Omit<ComponentPropsWithoutRef<typeof BasePopover.Close>, 'color'>, StyledComponentProps {}

export interface PopoverArrowProps
  extends Omit<ComponentPropsWithoutRef<typeof BasePopover.Arrow>, 'color'>, StyledComponentProps {}

function PopoverRoot<Payload>({ variant, color, size, ...props }: PopoverRootProps<Payload>) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <PopoverStyleContext.Provider value={resolved}>
      <BasePopover.Root<Payload> {...props} />
    </PopoverStyleContext.Provider>
  );
}

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { className, variant, color, size, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BasePopover.Trigger
      ref={ref}
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const PopoverPortal = forwardRef<
  ElementRef<typeof BasePopover.Portal>,
  ComponentPropsWithoutRef<typeof BasePopover.Portal>
>(function PopoverPortal({ className, ...props }, ref) {
  return (
    <BasePopover.Portal
      ref={ref}
      className={withBaseClassName(styles.Portal, className)}
      {...props}
    />
  );
});

const PopoverBackdrop = forwardRef<
  ElementRef<typeof BasePopover.Backdrop>,
  ComponentPropsWithoutRef<typeof BasePopover.Backdrop>
>(function PopoverBackdrop({ className, ...props }, ref) {
  return (
    <BasePopover.Backdrop
      ref={ref}
      className={withBaseClassName(styles.Backdrop, className)}
      {...props}
    />
  );
});

const PopoverPositioner = forwardRef<
  ElementRef<typeof BasePopover.Positioner>,
  ComponentPropsWithoutRef<typeof BasePopover.Positioner>
>(function PopoverPositioner({ className, ...props }, ref) {
  return (
    <BasePopover.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const PopoverPopup = forwardRef<ElementRef<typeof BasePopover.Popup>, PopoverPopupProps>(
  function PopoverPopup({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BasePopover.Popup
        ref={ref}
        className={withBaseClassName(styles.Popup, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const PopoverArrow = forwardRef<ElementRef<typeof BasePopover.Arrow>, PopoverArrowProps>(
  function PopoverArrow({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BasePopover.Arrow
        ref={ref}
        className={withBaseClassName(styles.Arrow, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const PopoverTitle = forwardRef<
  ElementRef<typeof BasePopover.Title>,
  ComponentPropsWithoutRef<typeof BasePopover.Title>
>(function PopoverTitle({ className, ...props }, ref) {
  return (
    <BasePopover.Title
      ref={ref}
      className={withBaseClassName(styles.Title, className)}
      {...props}
    />
  );
});

const PopoverDescription = forwardRef<
  ElementRef<typeof BasePopover.Description>,
  ComponentPropsWithoutRef<typeof BasePopover.Description>
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={withBaseClassName(styles.Description, className)}
      {...props}
    />
  );
});

const PopoverClose = forwardRef<ElementRef<typeof BasePopover.Close>, PopoverCloseProps>(
  function PopoverClose({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BasePopover.Close
        ref={ref}
        className={withBaseClassName(styles.Close, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const PopoverViewport = forwardRef<
  ElementRef<typeof BasePopover.Viewport>,
  ComponentPropsWithoutRef<typeof BasePopover.Viewport>
>(function PopoverViewport({ className, ...props }, ref) {
  return (
    <BasePopover.Viewport
      ref={ref}
      className={withBaseClassName(styles.Viewport, className)}
      {...props}
    />
  );
});

PopoverRoot.displayName = 'Popover.Root';
PopoverTrigger.displayName = 'Popover.Trigger';
PopoverPortal.displayName = 'Popover.Portal';
PopoverBackdrop.displayName = 'Popover.Backdrop';
PopoverPositioner.displayName = 'Popover.Positioner';
PopoverPopup.displayName = 'Popover.Popup';
PopoverArrow.displayName = 'Popover.Arrow';
PopoverTitle.displayName = 'Popover.Title';
PopoverDescription.displayName = 'Popover.Description';
PopoverClose.displayName = 'Popover.Close';
PopoverViewport.displayName = 'Popover.Viewport';

type PopoverCompound = typeof PopoverRoot & {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Portal: typeof PopoverPortal;
  Backdrop: typeof PopoverBackdrop;
  Positioner: typeof PopoverPositioner;
  Popup: typeof PopoverPopup;
  Arrow: typeof PopoverArrow;
  Title: typeof PopoverTitle;
  Description: typeof PopoverDescription;
  Close: typeof PopoverClose;
  Viewport: typeof PopoverViewport;
  Handle: typeof BasePopover.Handle;
  createHandle: typeof BasePopover.createHandle;
};

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Backdrop: PopoverBackdrop,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Arrow: PopoverArrow,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Viewport: PopoverViewport,
  Handle: BasePopover.Handle,
  createHandle: BasePopover.createHandle,
}) as PopoverCompound;
