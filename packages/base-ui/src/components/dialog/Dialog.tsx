import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  size?: DialogSize;
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  icon?: ReactNode;
}

export type DialogBodyProps = HTMLAttributes<HTMLDivElement>;

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export type DialogCloseProps = HTMLAttributes<HTMLButtonElement>;

interface DialogContextValue {
  onClose: () => void;
  titleId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const DialogRoot = forwardRef<HTMLDivElement, DialogProps>(function DialogRoot(
  { open, onClose, size = 'md', className, children, ...props },
  ref,
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const dialogRef = (ref as React.RefObject<HTMLDivElement>) ?? internalRef;
  const titleId = `ov-dialog-title-${useId()}`;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open, dialogRef]);

  if (!open) return null;

  return createPortal(
    <DialogContext.Provider value={{ onClose, titleId }}>
      <div className={styles.Overlay} data-ov-component="dialog">
        <div
          className={styles.Backdrop}
          data-ov-slot="backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={dialogRef}
          className={cn(styles.Surface, className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-ov-component="dialog"
          data-ov-slot="surface"
          data-ov-size={size}
          {...props}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>,
    document.body,
  );
});

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { icon, className, children, ...props },
  ref,
) {
  const ctx = useContext(DialogContext);

  return (
    <h2
      ref={ref}
      id={ctx?.titleId}
      className={cn(styles.Title, className)}
      data-ov-component="dialog"
      data-ov-slot="title"
      {...props}
    >
      {icon ? (
        <span className={styles.TitleIcon} data-ov-slot="title-icon">
          {icon}
        </span>
      ) : null}
      {children}
    </h2>
  );
});

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(function DialogBody(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Body, className)}
      data-ov-component="dialog"
      data-ov-slot="body"
      {...props}
    />
  );
});

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Footer, className)}
      data-ov-component="dialog"
      data-ov-slot="footer"
      {...props}
    />
  );
});

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { className, onClick, ...props },
  ref,
) {
  const ctx = useContext(DialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      ctx?.onClose();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(styles.Close, className)}
      data-ov-component="dialog"
      data-ov-slot="close"
      aria-label="Close"
      onClick={handleClick}
      {...props}
    >
      <LuX aria-hidden size={16} />
    </button>
  );
});

DialogRoot.displayName = 'Dialog';
DialogTitle.displayName = 'Dialog.Title';
DialogBody.displayName = 'Dialog.Body';
DialogFooter.displayName = 'Dialog.Footer';
DialogClose.displayName = 'Dialog.Close';

type DialogCompound = typeof DialogRoot & {
  Title: typeof DialogTitle;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
  Close: typeof DialogClose;
};

export const Dialog = Object.assign(DialogRoot, {
  Title: DialogTitle,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
}) as DialogCompound;
