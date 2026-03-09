import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LuChevronRight, LuEllipsis } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /** Separator rendered between items. Defaults to a chevron right icon. */
  separator?: ReactNode;
  /** Maximum number of visible items before collapsing. Defaults to 8. */
  maxItems?: number;
  /** Number of items to show before the ellipsis. Defaults to 1. */
  itemsBeforeCollapse?: number;
  /** Number of items to show after the ellipsis. Defaults to 1. */
  itemsAfterCollapse?: number;
  /** Controls font size of the breadcrumb trail. */
  size?: ComponentSize;
}

type BreadcrumbItemBaseProps = {
  /** Marks this item as the current page (not a link, styled differently). */
  active?: boolean;
};

export type BreadcrumbItemProps =
  | (BreadcrumbItemBaseProps & Omit<HTMLAttributes<HTMLElement>, 'color'> & { href?: never })
  | (BreadcrumbItemBaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> & { href: string });

/* ----- BreadcrumbsItem ----- */

const BreadcrumbsItem = forwardRef<HTMLElement, BreadcrumbItemProps>(function BreadcrumbsItem(
  { className, href, active = false, children, ...props },
  ref,
) {
  if (href && !active) {
    return (
      <span className={cn(styles.Item, className)} data-ov-active="false">
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={styles.Link}
          {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>)}
        >
          {children}
        </a>
      </span>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(styles.Item, className)}
      data-ov-active={active ? 'true' : 'false'}
      aria-current={active ? 'page' : undefined}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      <span className={styles.Text}>{children}</span>
    </span>
  );
});

BreadcrumbsItem.displayName = 'Breadcrumbs.Item';

/* ----- BreadcrumbsRoot ----- */

const BreadcrumbsRoot = forwardRef<HTMLElement, BreadcrumbsProps>(function BreadcrumbsRoot(
  {
    className,
    separator = <LuChevronRight aria-hidden />,
    maxItems = 8,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    size = 'md',
    children,
    ...props
  },
  ref,
) {
  const [expanded, setExpanded] = useState(false);
  const childArray = Children.toArray(children).filter(isValidElement);
  const totalItems = childArray.length;

  // Reset expansion when the trail changes
  useEffect(() => {
    setExpanded(false);
  }, [totalItems, maxItems]);

  const shouldCollapse = !expanded && totalItems > maxItems;

  let visibleItems: ReactNode[];

  if (shouldCollapse) {
    // Clamp before/after so slices never overlap and total (including ellipsis) <= maxItems
    const effectiveBefore = Math.min(
      Math.max(0, itemsBeforeCollapse),
      Math.max(0, maxItems - 1 - itemsAfterCollapse),
    );
    const effectiveAfter = Math.min(
      Math.max(0, itemsAfterCollapse),
      Math.max(0, maxItems - 1 - effectiveBefore),
    );

    // If both are 0, collapsing would show only the ellipsis — skip it
    if (effectiveBefore + effectiveAfter === 0) {
      visibleItems = childArray;
    } else {

    const before = childArray.slice(0, effectiveBefore);
    const after = childArray.slice(totalItems - effectiveAfter);

    const ellipsis = (
      <span key="__ov-breadcrumbs-ellipsis" className={styles.Item}>
        <button
          type="button"
          className={styles.Ellipsis}
          aria-label="Show more breadcrumbs"
          onClick={() => {
            setExpanded(true);
          }}
        >
          <LuEllipsis aria-hidden />
        </button>
      </span>
    );

    visibleItems = [...before, ellipsis, ...after];
    }
  } else {
    visibleItems = childArray;
  }

  return (
    <nav
      ref={ref}
      className={cn(styles.Root, className)}
      aria-label="breadcrumb"
      data-ov-size={size}
      {...props}
    >
      <ol className={styles.List}>
        {visibleItems.map((child, index) => (
          <li key={isValidElement(child) ? (child.key ?? index) : index} className={styles.Entry}>
            {child}
            {index < visibleItems.length - 1 ? (
              <span className={styles.Separator} aria-hidden="true" data-ov-role="separator">
                {separator}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
});

BreadcrumbsRoot.displayName = 'Breadcrumbs';

/* ----- Compound export ----- */

type BreadcrumbsCompound = typeof BreadcrumbsRoot & {
  Item: typeof BreadcrumbsItem;
};

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbsItem,
}) as BreadcrumbsCompound;
