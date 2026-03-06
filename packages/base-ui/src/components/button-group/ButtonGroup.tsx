import { createContext, forwardRef, useContext, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type {
  ComponentColor,
  ComponentSize,
  ComponentVariant,
  StyledComponentProps,
} from '../../system/types';
import { Button, type ButtonProps } from '../button';
import { IconButton, type IconButtonProps } from '../icon-button';
import styles from './ButtonGroup.module.css';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

type ButtonGroupContextValue = StyledComponentProps;

const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  orientation?: ButtonGroupOrientation;
  attached?: boolean;
}

export type ButtonGroupButtonProps = ButtonProps;
export type ButtonGroupIconButtonProps = IconButtonProps;

const ButtonGroupRoot = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroupRoot(
  {
    className,
    variant = 'soft',
    color = 'neutral',
    size = 'md',
    orientation = 'horizontal',
    attached = true,
    role = 'group',
    ...props
  },
  ref,
) {
  return (
    <ButtonGroupContext.Provider value={{ variant, color, size }}>
      <div
        ref={ref}
        role={role}
        aria-orientation={orientation}
        className={cn(styles.Root, className)}
        data-ov-orientation={orientation}
        data-ov-attached={attached ? 'true' : 'false'}
        {...props}
      />
    </ButtonGroupContext.Provider>
  );
});

const ButtonGroupButton = forwardRef<HTMLElement, ButtonGroupButtonProps>(
  function ButtonGroupButton({ variant, color, size, ...props }, ref) {
    const group = useContext(ButtonGroupContext);

    return (
      <Button
        ref={ref}
        variant={(variant ?? group?.variant ?? 'soft') as ComponentVariant}
        color={(color ?? group?.color ?? 'neutral') as ComponentColor}
        size={(size ?? group?.size ?? 'md') as ComponentSize}
        {...props}
      />
    );
  },
);

const ButtonGroupIconButton = forwardRef<HTMLElement, ButtonGroupIconButtonProps>(
  function ButtonGroupIconButton({ variant, color, size, ...props }, ref) {
    const group = useContext(ButtonGroupContext);

    return (
      <IconButton
        ref={ref}
        variant={(variant ?? group?.variant ?? 'soft') as ComponentVariant}
        color={(color ?? group?.color ?? 'neutral') as ComponentColor}
        size={(size ?? group?.size ?? 'md') as ComponentSize}
        {...props}
      />
    );
  },
);

ButtonGroupRoot.displayName = 'ButtonGroup';
ButtonGroupButton.displayName = 'ButtonGroup.Button';
ButtonGroupIconButton.displayName = 'ButtonGroup.IconButton';

type ButtonGroupCompound = typeof ButtonGroupRoot & {
  Button: typeof ButtonGroupButton;
  IconButton: typeof ButtonGroupIconButton;
};

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Button: ButtonGroupButton,
  IconButton: ButtonGroupIconButton,
}) as ButtonGroupCompound;
