import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './NumberInput.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const NumberInputStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(NumberInputStyleContext);

  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface NumberInputRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseNumberField.Root>, 'color'>,
    StyledComponentProps {}

export interface NumberInputGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseNumberField.Group>, 'color'>,
    StyledComponentProps {}

export interface NumberInputInputProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseNumberField.Input>, 'color' | 'size'>,
    StyledComponentProps {}

export interface NumberInputStepperProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseNumberField.Increment>, 'color'>,
    StyledComponentProps {
  children?: ReactNode;
}

export type NumberInputLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export type NumberInputDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type NumberInputErrorProps = HTMLAttributes<HTMLDivElement>;

const NumberInputRoot = forwardRef<ElementRef<typeof BaseNumberField.Root>, NumberInputRootProps>(
  function NumberInputRoot({ variant, color, size, className, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <NumberInputStyleContext.Provider value={resolved}>
        <BaseNumberField.Root
          ref={ref}
          className={withBaseClassName<BaseNumberField.Root.State>(styles.Root, className)}
          {...styleDataAttributes(resolved)}
          {...props}
        />
      </NumberInputStyleContext.Provider>
    );
  },
);

const NumberInputLabel = forwardRef<HTMLLabelElement, NumberInputLabelProps>(function NumberInputLabel(
  { className, ...props },
  ref,
) {
  return <label ref={ref} className={cn(styles.Label, className)} {...props} />;
});

const NumberInputGroup = forwardRef<ElementRef<typeof BaseNumberField.Group>, NumberInputGroupProps>(
  function NumberInputGroup({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseNumberField.Group
        ref={ref}
        className={withBaseClassName<BaseNumberField.Group.State>(styles.Group, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const NumberInputInput = forwardRef<ElementRef<typeof BaseNumberField.Input>, NumberInputInputProps>(
  function NumberInputInput({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseNumberField.Input
        ref={ref}
        className={withBaseClassName<BaseNumberField.Input.State>(styles.Input, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const NumberInputIncrement = forwardRef<
  ElementRef<typeof BaseNumberField.Increment>,
  NumberInputStepperProps
>(function NumberInputIncrement({ className, variant, color, size, children, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseNumberField.Increment
      ref={ref}
      className={withBaseClassName<BaseNumberField.Increment.State>(styles.Increment, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {children ?? <LuPlus aria-hidden />}
    </BaseNumberField.Increment>
  );
});

const NumberInputDecrement = forwardRef<
  ElementRef<typeof BaseNumberField.Decrement>,
  NumberInputStepperProps
>(function NumberInputDecrement({ className, variant, color, size, children, ...props }, ref) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <BaseNumberField.Decrement
      ref={ref}
      className={withBaseClassName<BaseNumberField.Decrement.State>(styles.Decrement, className)}
      {...styleDataAttributes(resolved)}
      {...props}
    >
      {children ?? <LuMinus aria-hidden />}
    </BaseNumberField.Decrement>
  );
});

const NumberInputDescription = forwardRef<HTMLParagraphElement, NumberInputDescriptionProps>(
  function NumberInputDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn(styles.Description, className)} {...props} />;
  },
);

const NumberInputError = forwardRef<HTMLDivElement, NumberInputErrorProps>(function NumberInputError(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Error, className)} {...props} />;
});

NumberInputRoot.displayName = 'NumberInput.Root';
NumberInputLabel.displayName = 'NumberInput.Label';
NumberInputGroup.displayName = 'NumberInput.Group';
NumberInputInput.displayName = 'NumberInput.Input';
NumberInputIncrement.displayName = 'NumberInput.Increment';
NumberInputDecrement.displayName = 'NumberInput.Decrement';
NumberInputDescription.displayName = 'NumberInput.Description';
NumberInputError.displayName = 'NumberInput.Error';

type NumberInputCompound = typeof NumberInputRoot & {
  Root: typeof NumberInputRoot;
  Label: typeof NumberInputLabel;
  Group: typeof NumberInputGroup;
  Input: typeof NumberInputInput;
  Increment: typeof NumberInputIncrement;
  Decrement: typeof NumberInputDecrement;
  Description: typeof NumberInputDescription;
  Error: typeof NumberInputError;
  ScrubArea: typeof BaseNumberField.ScrubArea;
  ScrubAreaCursor: typeof BaseNumberField.ScrubAreaCursor;
};

export const NumberInput = Object.assign(NumberInputRoot, {
  Root: NumberInputRoot,
  Label: NumberInputLabel,
  Group: NumberInputGroup,
  Input: NumberInputInput,
  Increment: NumberInputIncrement,
  Decrement: NumberInputDecrement,
  Description: NumberInputDescription,
  Error: NumberInputError,
  ScrubArea: BaseNumberField.ScrubArea,
  ScrubAreaCursor: BaseNumberField.ScrubAreaCursor,
}) as NumberInputCompound;
