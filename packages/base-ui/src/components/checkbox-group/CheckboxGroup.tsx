import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import { Checkbox, type CheckboxItemProps } from '../checkbox';
import styles from './CheckboxGroup.module.css';

interface CheckboxGroupContextValue extends StyledComponentProps {}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCheckboxGroup>, 'color'>, StyledComponentProps {
  orientation?: 'vertical' | 'horizontal';
}

export interface CheckboxGroupItemProps
  extends Omit<CheckboxItemProps, 'variant' | 'color' | 'size' | 'value'>, StyledComponentProps {
  value: string;
}

const CheckboxGroupRoot = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroupRoot(
  {
    className,
    variant = DEFAULT_VARIANT,
    color = DEFAULT_COLOR,
    size = DEFAULT_SIZE,
    orientation = 'vertical',
    ...props
  },
  ref,
) {
  return (
    <CheckboxGroupContext.Provider value={{ variant, color, size }}>
      <BaseCheckboxGroup
        ref={ref}
        className={withBaseClassName<BaseCheckboxGroup.State>(styles.Root, className)}
        data-ov-orientation={orientation}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    </CheckboxGroupContext.Provider>
  );
});

const CheckboxGroupItem = forwardRef<HTMLElement, CheckboxGroupItemProps>(
  function CheckboxGroupItem({ className, variant, color, size, ...props }, ref) {
    const group = useContext(CheckboxGroupContext);

    return (
      <Checkbox.Item
        ref={ref}
        className={withBaseClassName(styles.Item, className)}
        variant={variant ?? group?.variant ?? DEFAULT_VARIANT}
        color={color ?? group?.color ?? DEFAULT_COLOR}
        size={size ?? group?.size ?? DEFAULT_SIZE}
        {...props}
      />
    );
  },
);

CheckboxGroupRoot.displayName = 'CheckboxGroup';
CheckboxGroupItem.displayName = 'CheckboxGroup.Item';

type CheckboxGroupCompound = typeof CheckboxGroupRoot & {
  Item: typeof CheckboxGroupItem;
};

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Item: CheckboxGroupItem,
}) as CheckboxGroupCompound;
