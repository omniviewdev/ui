import { forwardRef, type HTMLAttributes } from 'react';
import { Select } from '@omniview/base-ui';
import type { ComponentSize, ComponentVariant } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuBot, LuChevronDown } from '../../system/icons';
import styles from './AIModelSelector.module.css';

export interface AIModel {
  id: string;
  name: string;
  description?: string;
}

export interface AIModelSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onChange'> {
  /** Available models */
  models: AIModel[];
  /** Currently selected model ID */
  value?: string;
  /** Selection callback */
  onChange?: (modelId: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant. Default: 'sm'. */
  size?: ComponentSize;
  /** Visual variant. Default: 'outline'. */
  variant?: ComponentVariant;
  /** Whether to show the bot icon. Default: true. */
  showIcon?: boolean;
}

export const AIModelSelector = forwardRef<HTMLDivElement, AIModelSelectorProps>(
  function AIModelSelector(
    { models, value, onChange, disabled, size = 'sm', variant = 'outline', showIcon = true, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <Select
          value={value}
          onValueChange={(val) => { if (val != null && onChange) onChange(val); }}
          disabled={disabled}
          variant={variant}
          color="neutral"
          size={size}
        >
          <Select.Trigger startDecorator={showIcon ? <LuBot size={14} /> : undefined}>
            <Select.Value placeholder="Select model" />
            <Select.Icon>
              <LuChevronDown size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6}>
              <Select.Popup>
                <Select.List>
                  {models.map((model) => (
                    <Select.Item key={model.id} value={model.id}>
                      <Select.ItemText>{model.name}</Select.ItemText>
                      {model.description && (
                        <span className={styles.ItemDescription}>{model.description}</span>
                      )}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select>
      </div>
    );
  },
);
