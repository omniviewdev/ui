import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import styles from './Slider.module.css';

type ResolvedStyleProps = Required<StyledComponentProps>;

const SliderStyleContext = createContext<ResolvedStyleProps>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(SliderStyleContext);

  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface SliderRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Root>, 'color'>, StyledComponentProps {}

export type SliderLabelProps = HTMLAttributes<HTMLSpanElement>;

export interface SliderControlProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseSlider.Control>, 'color'>,
    StyledComponentProps {}

export interface SliderTrackProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Track>, 'color'>, StyledComponentProps {}

export interface SliderIndicatorProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseSlider.Indicator>, 'color'>,
    StyledComponentProps {}

export interface SliderThumbProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Thumb>, 'color'>, StyledComponentProps {}

export interface SliderValueProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSlider.Value>, 'color'>, StyledComponentProps {}

const SliderRoot = forwardRef<ElementRef<typeof BaseSlider.Root>, SliderRootProps>(
  function SliderRoot({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <SliderStyleContext.Provider value={resolved}>
        <BaseSlider.Root
          ref={ref}
          className={withBaseClassName<BaseSlider.Root.State>(styles.Root, className)}
          {...styleDataAttributes(resolved)}
          {...props}
        />
      </SliderStyleContext.Provider>
    );
  },
);

const SliderLabel = forwardRef<HTMLSpanElement, SliderLabelProps>(function SliderLabel(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Label, className)} {...props} />;
});

const SliderValue = forwardRef<ElementRef<typeof BaseSlider.Value>, SliderValueProps>(
  function SliderValue({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSlider.Value
        ref={ref}
        className={withBaseClassName(styles.Value, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SliderControl = forwardRef<ElementRef<typeof BaseSlider.Control>, SliderControlProps>(
  function SliderControl({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSlider.Control
        ref={ref}
        className={withBaseClassName<BaseSlider.Control.State>(styles.Control, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SliderTrack = forwardRef<ElementRef<typeof BaseSlider.Track>, SliderTrackProps>(
  function SliderTrack({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSlider.Track
        ref={ref}
        className={withBaseClassName(styles.Track, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SliderIndicator = forwardRef<ElementRef<typeof BaseSlider.Indicator>, SliderIndicatorProps>(
  function SliderIndicator({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSlider.Indicator
        ref={ref}
        className={withBaseClassName(styles.Indicator, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const SliderThumb = forwardRef<ElementRef<typeof BaseSlider.Thumb>, SliderThumbProps>(
  function SliderThumb({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseSlider.Thumb
        ref={ref}
        className={withBaseClassName<BaseSlider.Thumb.State>(styles.Thumb, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

SliderRoot.displayName = 'Slider.Root';
SliderLabel.displayName = 'Slider.Label';
SliderValue.displayName = 'Slider.Value';
SliderControl.displayName = 'Slider.Control';
SliderTrack.displayName = 'Slider.Track';
SliderIndicator.displayName = 'Slider.Indicator';
SliderThumb.displayName = 'Slider.Thumb';

type SliderCompound = typeof SliderRoot & {
  Root: typeof SliderRoot;
  Label: typeof SliderLabel;
  Value: typeof SliderValue;
  Control: typeof SliderControl;
  Track: typeof SliderTrack;
  Indicator: typeof SliderIndicator;
  Thumb: typeof SliderThumb;
};

export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Label: SliderLabel,
  Value: SliderValue,
  Control: SliderControl,
  Track: SliderTrack,
  Indicator: SliderIndicator,
  Thumb: SliderThumb,
}) as SliderCompound;
