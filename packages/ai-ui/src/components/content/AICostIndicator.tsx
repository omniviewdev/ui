import { forwardRef, type HTMLAttributes } from 'react';
import { Chip } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuCoins } from '../../system/icons';
import styles from './AICostIndicator.module.css';

export interface AICostIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Cost value */
  cost: number;
  /** Currency symbol (default: "$") */
  currency?: string;
}

export const AICostIndicator = forwardRef<HTMLSpanElement, AICostIndicatorProps>(
  function AICostIndicator(
    { cost, currency = '$', className, ...rest },
    ref,
  ) {
    return (
      <Chip
        ref={ref}
        className={cn(styles.Root, className)}
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={<LuCoins size={12} />}
        {...rest}
      >
        {currency}{cost.toFixed(4)}
      </Chip>
    );
  },
);
