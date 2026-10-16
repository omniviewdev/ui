import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { useMemo, type ComponentPropsWithoutRef } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import { Radio, RadioGroupContext, type RadioItemProps } from '../radio/Radio';
import styles from './RadioGroup.module.css';

export interface RadioGroupProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseRadioGroup<string>>, 'color'>,
    StyledComponentProps {
  orientation?: 'vertical' | 'horizontal';
}

export interface RadioGroupItemProps
  extends Omit<RadioItemProps, 'variant' | 'color' | 'size' | 'value'>, StyledComponentProps {
  value: string;
}

export function RadioGroupRoot({
  className,
  variant = DEFAULT_VARIANT,
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  const contextValue = useMemo(() => ({ variant, color, size }), [variant, color, size]);
  return (
    <RadioGroupContext.Provider value={contextValue}>
      <BaseRadioGroup
        className={withBaseClassName<BaseRadioGroup.State>(styles.Root, className)}
        data-ov-orientation={orientation}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return <Radio.Item className={withBaseClassName(styles.Item, className)} {...props} />;
}

RadioGroupRoot.displayName = 'RadioGroup';
RadioGroupItem.displayName = 'RadioGroup.Item';

type RadioGroupCompound = typeof RadioGroupRoot & {
  Item: typeof RadioGroupItem;
};

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
}) as RadioGroupCompound;
