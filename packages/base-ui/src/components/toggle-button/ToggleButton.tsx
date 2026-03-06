import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { forwardRef, type ReactNode } from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import buttonStyles from '../button/Button.module.css';
import styles from './ToggleButton.module.css';

export interface ToggleButtonProps
  extends Omit<BaseToggle.Props<string>, 'color'>,
    StyledComponentProps {
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { className, variant, color, size, startDecorator, endDecorator, children, ...props },
  ref,
) {
  return (
    <BaseToggle
      ref={ref}
      className={withBaseClassName<BaseToggle.State>(cn(buttonStyles.Root, styles.Root), className)}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    >
      {startDecorator ? (
        <span className={buttonStyles.Decorator} data-ov-slot="start-decorator">
          {startDecorator}
        </span>
      ) : null}
      {children}
      {endDecorator ? (
        <span className={buttonStyles.Decorator} data-ov-slot="end-decorator">
          {endDecorator}
        </span>
      ) : null}
    </BaseToggle>
  );
});

ToggleButton.displayName = 'ToggleButton';
