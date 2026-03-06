import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
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
import styles from './AlertDialog.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const AlertDialogStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(AlertDialogStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface AlertDialogRootProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAlertDialog.Root>, 'color'>,
    StyledComponentProps {}

export interface AlertDialogTriggerProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAlertDialog.Trigger>, 'color'>,
    StyledComponentProps {}

export interface AlertDialogPopupProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAlertDialog.Popup>, 'color'>,
    StyledComponentProps {}

export interface AlertDialogCloseProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAlertDialog.Close>, 'color'>,
    StyledComponentProps {}

const AlertDialogRoot = ({ variant, color, size, ...props }: AlertDialogRootProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <AlertDialogStyleContext.Provider value={resolved}>
      <BaseAlertDialog.Root {...props} />
    </AlertDialogStyleContext.Provider>
  );
};

const AlertDialogTrigger = ({
  className,
  variant,
  color,
  size,
  ...props
}: AlertDialogTriggerProps) => {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAlertDialog.Trigger
      className={withBaseClassName(styles.Trigger, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
};

const AlertDialogBackdrop = forwardRef<
  ElementRef<typeof BaseAlertDialog.Backdrop>,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Backdrop>
>(function AlertDialogBackdrop({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Backdrop
      ref={ref}
      className={withBaseClassName(styles.Backdrop, className)}
      {...props}
    />
  );
});

const AlertDialogPopup = forwardRef<
  ElementRef<typeof BaseAlertDialog.Popup>,
  AlertDialogPopupProps
>(function AlertDialogPopup({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAlertDialog.Popup
      ref={ref}
      className={withBaseClassName(styles.Popup, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

const AlertDialogTitle = forwardRef<
  ElementRef<typeof BaseAlertDialog.Title>,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Title
      ref={ref}
      className={withBaseClassName(styles.Title, className)}
      {...props}
    />
  );
});

const AlertDialogDescription = forwardRef<
  ElementRef<typeof BaseAlertDialog.Description>,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Description
      ref={ref}
      className={withBaseClassName(styles.Description, className)}
      {...props}
    />
  );
});

const AlertDialogClose = forwardRef<
  ElementRef<typeof BaseAlertDialog.Close>,
  AlertDialogCloseProps
>(function AlertDialogClose({ className, variant, color, size, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseAlertDialog.Close
      ref={ref}
      className={withBaseClassName(styles.Close, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    />
  );
});

AlertDialogRoot.displayName = 'AlertDialog.Root';
AlertDialogTrigger.displayName = 'AlertDialog.Trigger';
AlertDialogBackdrop.displayName = 'AlertDialog.Backdrop';
AlertDialogPopup.displayName = 'AlertDialog.Popup';
AlertDialogTitle.displayName = 'AlertDialog.Title';
AlertDialogDescription.displayName = 'AlertDialog.Description';
AlertDialogClose.displayName = 'AlertDialog.Close';

type AlertDialogCompound = typeof AlertDialogRoot & {
  Root: typeof AlertDialogRoot;
  Backdrop: typeof AlertDialogBackdrop;
  Close: typeof AlertDialogClose;
  Description: typeof AlertDialogDescription;
  Handle: typeof BaseAlertDialog.Handle;
  Popup: typeof AlertDialogPopup;
  Portal: typeof BaseAlertDialog.Portal;
  Title: typeof AlertDialogTitle;
  Trigger: typeof AlertDialogTrigger;
  Viewport: typeof BaseAlertDialog.Viewport;
  createHandle: typeof BaseAlertDialog.createHandle;
};

export const AlertDialog = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Backdrop: AlertDialogBackdrop,
  Close: AlertDialogClose,
  Description: AlertDialogDescription,
  Handle: BaseAlertDialog.Handle,
  Popup: AlertDialogPopup,
  Portal: BaseAlertDialog.Portal,
  Title: AlertDialogTitle,
  Trigger: AlertDialogTrigger,
  Viewport: BaseAlertDialog.Viewport,
  createHandle: BaseAlertDialog.createHandle,
}) as AlertDialogCompound;
