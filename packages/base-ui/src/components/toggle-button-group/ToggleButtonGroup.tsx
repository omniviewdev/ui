import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { createContext, forwardRef, useContext } from 'react';
import { withBaseClassName } from '../../system/classnames';
import type { StyledComponentProps } from '../../system/types';
import { styleDataAttributes } from '../../system/styleProps';
import { ToggleButton, type ToggleButtonProps } from '../toggle-button';
import styles from './ToggleButtonGroup.module.css';

type ToggleButtonGroupContextValue = StyledComponentProps;

const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);

export interface ToggleButtonGroupProps
  extends Omit<BaseToggleGroup.Props<string>, 'color'>, StyledComponentProps {
  attached?: boolean;
}

export interface ToggleButtonGroupItemProps extends Omit<ToggleButtonProps, 'value'> {
  value: string;
}

const ToggleButtonGroupRoot = forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  function ToggleButtonGroupRoot(
    {
      className,
      variant = 'soft',
      color = 'neutral',
      size = 'md',
      attached = true,
      orientation = 'horizontal',
      role = 'group',
      ...props
    },
    ref,
  ) {
    return (
      <ToggleButtonGroupContext.Provider value={{ variant, color, size }}>
        <BaseToggleGroup
          ref={ref}
          orientation={orientation}
          role={role}
          className={withBaseClassName<BaseToggleGroup.State>(styles.Root, className)}
          data-ov-attached={attached ? 'true' : 'false'}
          {...styleDataAttributes({ variant, color, size })}
          {...props}
        />
      </ToggleButtonGroupContext.Provider>
    );
  },
);

const ToggleButtonGroupItem = forwardRef<HTMLButtonElement, ToggleButtonGroupItemProps>(
  function ToggleButtonGroupItem({ className, variant, color, size, ...props }, ref) {
    const group = useContext(ToggleButtonGroupContext);

    return (
      <ToggleButton
        ref={ref}
        className={withBaseClassName(styles.Item, className)}
        variant={variant ?? group?.variant ?? 'soft'}
        color={color ?? group?.color ?? 'neutral'}
        size={size ?? group?.size ?? 'md'}
        {...props}
      />
    );
  },
);

ToggleButtonGroupRoot.displayName = 'ToggleButtonGroup';
ToggleButtonGroupItem.displayName = 'ToggleButtonGroup.Item';

type ToggleButtonGroupCompound = typeof ToggleButtonGroupRoot & {
  Item: typeof ToggleButtonGroupItem;
};

export const ToggleButtonGroup = Object.assign(ToggleButtonGroupRoot, {
  Item: ToggleButtonGroupItem,
}) as ToggleButtonGroupCompound;
