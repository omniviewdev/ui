import { forwardRef, type ReactNode } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { Button, type ButtonProps } from '../button';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLElement, IconButtonProps>(function IconButton(
  { className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      className={withBaseClassName(styles.Root, className)}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';
