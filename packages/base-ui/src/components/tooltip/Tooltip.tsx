import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
import styles from './Tooltip.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

interface TooltipContextValue extends ResolvedStyleProps {
  lazy: boolean;
  hasOpened: boolean;
}

const TooltipStyleContext = createContext<TooltipContextValue>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
  lazy: false,
  hasOpened: false,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(TooltipStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export type TooltipRootProps<Payload = unknown> = Omit<BaseTooltip.Root.Props<Payload>, 'color'> &
  StyledComponentProps & {
    /** Defer content rendering until the tooltip first opens. Default: false */
    lazy?: boolean;
  };

export interface TooltipTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseTooltip.Trigger>, 'color'>,
    StyledComponentProps {}

export interface TooltipPopupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTooltip.Popup>, 'color'>, StyledComponentProps {}

export interface TooltipArrowProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseTooltip.Arrow>, 'color'>, StyledComponentProps {}

function TooltipRoot<Payload>({
  variant,
  color,
  size,
  lazy = false,
  defaultOpen,
  open,
  onOpenChange,
  ...props
}: TooltipRootProps<Payload>) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  const [hasOpened, setHasOpened] = useState(!lazy || !!defaultOpen || !!open);

  // Sync controlled open prop to hasOpened
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
    }
  }, [open, hasOpened]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, event: BaseTooltip.Root.ChangeEventDetails) => {
      if (nextOpen && !hasOpened) {
        setHasOpened(true);
      }
      onOpenChange?.(nextOpen, event);
    },
    [hasOpened, onOpenChange],
  );

  const contextValue = useMemo(
    () => ({ ...resolved, lazy, hasOpened }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolved.variant, resolved.color, resolved.size, lazy, hasOpened],
  );

  return (
    <TooltipStyleContext.Provider value={contextValue}>
      <BaseTooltip.Root<Payload>
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </TooltipStyleContext.Provider>
  );
}

const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(function TooltipTrigger(
  { className, variant, color, size, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });
  return (
    <BaseTooltip.Trigger
      ref={ref}
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const TooltipPortal = forwardRef<
  ElementRef<typeof BaseTooltip.Portal>,
  ComponentPropsWithoutRef<typeof BaseTooltip.Portal>
>(function TooltipPortal({ className, ...props }, ref) {
  return (
    <BaseTooltip.Portal
      ref={ref}
      className={withBaseClassName(styles.Portal, className)}
      {...props}
    />
  );
});

const TooltipPositioner = forwardRef<
  ElementRef<typeof BaseTooltip.Positioner>,
  ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>
>(function TooltipPositioner({ className, ...props }, ref) {
  return (
    <BaseTooltip.Positioner
      ref={ref}
      className={withBaseClassName(styles.Positioner, className)}
      {...props}
    />
  );
});

const TooltipPopup = forwardRef<ElementRef<typeof BaseTooltip.Popup>, TooltipPopupProps>(
  function TooltipPopup({ className, variant, color, size, children, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    const { lazy, hasOpened } = useContext(TooltipStyleContext);
    return (
      <BaseTooltip.Popup
        ref={ref}
        className={withBaseClassName(styles.Popup, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      >
        {lazy && !hasOpened ? null : children}
      </BaseTooltip.Popup>
    );
  },
);

const TooltipArrow = forwardRef<ElementRef<typeof BaseTooltip.Arrow>, TooltipArrowProps>(
  function TooltipArrow({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    return (
      <BaseTooltip.Arrow
        ref={ref}
        className={withBaseClassName(styles.Arrow, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const TooltipViewport = forwardRef<
  ElementRef<typeof BaseTooltip.Viewport>,
  ComponentPropsWithoutRef<typeof BaseTooltip.Viewport>
>(function TooltipViewport({ className, ...props }, ref) {
  return (
    <BaseTooltip.Viewport
      ref={ref}
      className={withBaseClassName(styles.Viewport, className)}
      {...props}
    />
  );
});

TooltipRoot.displayName = 'Tooltip.Root';
TooltipTrigger.displayName = 'Tooltip.Trigger';
TooltipPortal.displayName = 'Tooltip.Portal';
TooltipPositioner.displayName = 'Tooltip.Positioner';
TooltipPopup.displayName = 'Tooltip.Popup';
TooltipArrow.displayName = 'Tooltip.Arrow';
TooltipViewport.displayName = 'Tooltip.Viewport';

type TooltipCompound = typeof TooltipRoot & {
  Root: typeof TooltipRoot;
  Provider: typeof BaseTooltip.Provider;
  Trigger: typeof TooltipTrigger;
  Portal: typeof TooltipPortal;
  Positioner: typeof TooltipPositioner;
  Popup: typeof TooltipPopup;
  Arrow: typeof TooltipArrow;
  Viewport: typeof TooltipViewport;
  Handle: typeof BaseTooltip.Handle;
  createHandle: typeof BaseTooltip.createHandle;
};

export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Provider: BaseTooltip.Provider,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  Viewport: TooltipViewport,
  Handle: BaseTooltip.Handle,
  createHandle: BaseTooltip.createHandle,
}) as TooltipCompound;
