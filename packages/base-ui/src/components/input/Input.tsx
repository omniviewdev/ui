import { Field as BaseField } from '@base-ui/react/field';
import { Input as BaseInput } from '@base-ui/react/input';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './Input.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const InputStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(InputStyleContext);

  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface InputRootProps extends BaseField.Root.Props, StyledComponentProps {}

export type InputLabelProps = BaseField.Label.Props;

export type InputDescriptionProps = BaseField.Description.Props;

export type InputErrorProps = BaseField.Error.Props;

export interface InputControlProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseInput>, 'size' | 'color'>, StyledComponentProps {
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  mono?: boolean;
}

const InputRoot = forwardRef<HTMLDivElement, InputRootProps>(function InputRoot(
  { className, variant, color, size, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <InputStyleContext.Provider value={resolved}>
      <BaseField.Root
        ref={ref}
        className={withBaseClassName<BaseField.Root.State>(styles.Root, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    </InputStyleContext.Provider>
  );
});

const InputLabel = forwardRef<HTMLElement, InputLabelProps>(function InputLabel(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Label
      ref={ref}
      className={withBaseClassName<BaseField.Label.State>(styles.Label, className)}
      {...props}
    />
  );
});

const InputControl = forwardRef<ElementRef<typeof BaseInput>, InputControlProps>(
  function InputControl(
    {
      className,
      variant,
      color,
      size,
      startDecorator,
      endDecorator,
      mono = false,
      disabled,
      ...props
    },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <div
        className={styles.ControlShell}
        data-ov-mono={mono ? 'true' : undefined}
        data-disabled={disabled ? '' : undefined}
        {...styleDataAttributes(resolved)}
      >
        {startDecorator ? (
          <span className={styles.Decorator} data-ov-side="start">
            {startDecorator}
          </span>
        ) : null}
        <BaseInput
          ref={ref}
          className={withBaseClassName<BaseInput.State>(styles.Control, className)}
          data-ov-mono={mono ? 'true' : undefined}
          disabled={disabled}
          {...props}
        />
        {endDecorator ? (
          <span className={styles.Decorator} data-ov-side="end">
            {endDecorator}
          </span>
        ) : null}
      </div>
    );
  },
);

const InputDescription = forwardRef<HTMLParagraphElement, InputDescriptionProps>(
  function InputDescription({ className, ...props }, ref) {
    return (
      <BaseField.Description
        ref={ref}
        className={withBaseClassName<BaseField.Description.State>(styles.Description, className)}
        {...props}
      />
    );
  },
);

const InputError = forwardRef<HTMLDivElement, InputErrorProps>(function InputError(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Error
      ref={ref}
      className={withBaseClassName<BaseField.Error.State>(styles.Error, className)}
      {...props}
    />
  );
});

type InputCompound = typeof InputRoot & {
  Root: typeof InputRoot;
  Label: typeof InputLabel;
  Control: typeof InputControl;
  Description: typeof InputDescription;
  Error: typeof InputError;
};

InputRoot.displayName = 'Input.Root';
InputLabel.displayName = 'Input.Label';
InputControl.displayName = 'Input.Control';
InputDescription.displayName = 'Input.Description';
InputError.displayName = 'Input.Error';

export const Input = Object.assign(InputRoot, {
  Root: InputRoot,
  Label: InputLabel,
  Control: InputControl,
  Description: InputDescription,
  Error: InputError,
}) as InputCompound;
