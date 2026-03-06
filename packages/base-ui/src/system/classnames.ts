export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export type StatefulClassName<TState> =
  | string
  | ((state: TState) => string | undefined)
  | undefined;

export function withBaseClassName<TState>(
  baseClassName: string | undefined,
  className: StatefulClassName<TState>,
): StatefulClassName<TState> {
  if (typeof className === 'function') {
    return (state) => cn(baseClassName, className(state));
  }

  return cn(baseClassName, className);
}
