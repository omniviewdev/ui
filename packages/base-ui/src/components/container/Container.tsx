import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './Container.module.css';

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: ContainerMaxWidth;
  disableGutters?: boolean;
  fixed?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className, maxWidth = 'lg', disableGutters = false, fixed = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-max-width={maxWidth}
      data-ov-gutters={disableGutters ? 'false' : 'true'}
      {...(fixed ? { 'data-ov-fixed': 'true' } : undefined)}
      {...props}
    />
  );
});

Container.displayName = 'Container';
