import { Button as BaseButton } from '@base-ui/react/button';
import { forwardRef, type ReactNode } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Button.module.css';

export interface ButtonProps extends BaseButton.Props, StyledComponentProps {
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  { className, variant, color, size, startDecorator, endDecorator, children, ...props },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      className={withBaseClassName<BaseButton.State>(styles.Root, className)}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    >
      {startDecorator ? (
        <span className={styles.Decorator} data-ov-slot="start-decorator">
          {startDecorator}
        </span>
      ) : null}
      {children}
      {endDecorator ? (
        <span className={styles.Decorator} data-ov-slot="end-decorator">
          {endDecorator}
        </span>
      ) : null}
    </BaseButton>
  );
});

Button.displayName = 'Button';
