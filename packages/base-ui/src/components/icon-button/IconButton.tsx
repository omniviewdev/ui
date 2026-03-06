import { forwardRef, type ReactNode } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { Button, type ButtonProps } from '../button';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
  dense?: boolean;
}

export const IconButton = forwardRef<HTMLElement, IconButtonProps>(function IconButton(
  { className, dense = false, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      className={withBaseClassName(styles.Root, className)}
      data-ov-dense={dense ? 'true' : undefined}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';
