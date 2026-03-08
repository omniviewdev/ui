import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { createContext, useContext, type ComponentPropsWithoutRef } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import { Radio, type RadioItemProps } from '../radio';
import styles from './RadioGroup.module.css';

interface RadioGroupContextValue extends StyledComponentProps {}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

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
  return (
    <RadioGroupContext.Provider value={{ variant, color, size }}>
      <BaseRadioGroup
        className={withBaseClassName<BaseRadioGroup.State>(styles.Root, className)}
        data-ov-orientation={orientation}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ className, variant, color, size, ...props }: RadioGroupItemProps) {
  const group = useContext(RadioGroupContext);

  return (
    <Radio.Item
      className={withBaseClassName(styles.Item, className)}
      variant={variant ?? group?.variant ?? DEFAULT_VARIANT}
      color={color ?? group?.color ?? DEFAULT_COLOR}
      size={size ?? group?.size ?? DEFAULT_SIZE}
      {...props}
    />
  );
}

RadioGroupRoot.displayName = 'RadioGroup';
RadioGroupItem.displayName = 'RadioGroup.Item';

type RadioGroupCompound = typeof RadioGroupRoot & {
  Item: typeof RadioGroupItem;
};

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
}) as RadioGroupCompound;
