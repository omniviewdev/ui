import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps, ComponentColor } from '../../system/types';
import styles from './ConfirmButton.module.css';

export interface ConfirmButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'>, StyledComponentProps {
  /** Text shown in the confirm state. */
  confirmLabel?: string;
  /** Color applied in the confirm state. */
  confirmColor?: ComponentColor;
  /** Milliseconds before the confirm state reverts to default. */
  confirmTimeout?: number;
  /** Callback fired on the second (confirming) click. */
  onConfirm: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
  children: ReactNode;
}

export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  function ConfirmButton(
    {
      className,
      variant,
      color,
      size,
      confirmLabel = 'Confirm',
      confirmColor = 'danger',
      confirmTimeout = 3000,
      onConfirm,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    const [confirming, setConfirming] = useState(false);

    const handleClick = useCallback(() => {
      if (disabled) return;
      if (confirming) {
        onConfirm();
        setConfirming(false);
      } else {
        setConfirming(true);
      }
    }, [confirming, disabled, onConfirm]);

    useEffect(() => {
      if (!confirming) return;
      const timer = setTimeout(() => setConfirming(false), confirmTimeout);
      return () => clearTimeout(timer);
    }, [confirming, confirmTimeout]);

    const activeColor = confirming ? confirmColor : color;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.Root, className)}
        disabled={disabled}
        {...styleDataAttributes({ variant, color: activeColor, size })}
        {...(confirming ? { 'data-ov-confirming': 'true' } : undefined)}
        onClick={handleClick}
        {...props}
      >
        {confirming ? confirmLabel : children}
      </button>
    );
  },
);

ConfirmButton.displayName = 'ConfirmButton';
