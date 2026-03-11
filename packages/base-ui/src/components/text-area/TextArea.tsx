import { Field as BaseField } from '@base-ui/react/field';
import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './TextArea.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const TextAreaStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(TextAreaStyleContext);

  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface TextAreaRootProps extends BaseField.Root.Props, StyledComponentProps {}

export type TextAreaLabelProps = BaseField.Label.Props;

export type TextAreaDescriptionProps = BaseField.Description.Props;

export type TextAreaErrorProps = BaseField.Error.Props;

export interface TextAreaControlProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'color'>,
    StyledComponentProps {
  mono?: boolean;
  resize?: CSSProperties['resize'];
}

const TextAreaRoot = forwardRef<HTMLDivElement, TextAreaRootProps>(function TextAreaRoot(
  { className, variant, color, size, ...props },
  ref,
) {
  const resolved = useResolvedStyleProps({ variant, color, size });

  return (
    <TextAreaStyleContext.Provider value={resolved}>
      <BaseField.Root
        ref={ref}
        className={withBaseClassName<BaseField.Root.State>(styles.Root, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    </TextAreaStyleContext.Provider>
  );
});

const TextAreaLabel = forwardRef<HTMLElement, TextAreaLabelProps>(function TextAreaLabel(
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

const TextAreaControl = forwardRef<HTMLTextAreaElement, TextAreaControlProps>(
  function TextAreaControl(
    {
      className,
      variant,
      color,
      size,
      mono = false,
      resize = 'vertical',
      style,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <textarea
        ref={ref}
        className={cn(styles.Control, className)}
        data-ov-mono={mono ? 'true' : undefined}
        rows={rows}
        style={{ '--_textarea-resize': resize, ...style } as CSSProperties}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const TextAreaDescription = forwardRef<HTMLParagraphElement, TextAreaDescriptionProps>(
  function TextAreaDescription({ className, ...props }, ref) {
    return (
      <BaseField.Description
        ref={ref}
        className={withBaseClassName<BaseField.Description.State>(styles.Description, className)}
        {...props}
      />
    );
  },
);

const TextAreaError = forwardRef<HTMLDivElement, TextAreaErrorProps>(function TextAreaError(
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

TextAreaRoot.displayName = 'TextArea.Root';
TextAreaLabel.displayName = 'TextArea.Label';
TextAreaControl.displayName = 'TextArea.Control';
TextAreaDescription.displayName = 'TextArea.Description';
TextAreaError.displayName = 'TextArea.Error';

type TextAreaCompound = typeof TextAreaRoot & {
  Root: typeof TextAreaRoot;
  Label: typeof TextAreaLabel;
  Control: typeof TextAreaControl;
  Description: typeof TextAreaDescription;
  Error: typeof TextAreaError;
};

export const TextArea = Object.assign(TextAreaRoot, {
  Root: TextAreaRoot,
  Label: TextAreaLabel,
  Control: TextAreaControl,
  Description: TextAreaDescription,
  Error: TextAreaError,
}) as TextAreaCompound;
