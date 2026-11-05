import { useId, useState, type CSSProperties } from 'react';
import type { StateTimelineProps } from './types';
import { toneColor } from './format';
import { clampIndex, timelineSegments, validDomain } from './distributionGeometry';
import styles from './Distributions.module.css';

export function StateTimeline({
  lanes,
  states,
  domain,
  onIntervalSelect,
  label,
  className,
}: StateTimelineProps) {
  const id = useId();
  const [focus, setFocus] = useState({ lane: 0, segment: 0 });
  const valid = validDomain(domain);
  const prepared = lanes.map((lane) => timelineSegments(lane.intervals, domain));
  const laneIndex = clampIndex(focus.lane, lanes.length);
  const lane = lanes[laneIndex];
  const segments = prepared[laneIndex] ?? [];
  const segmentIndex = clampIndex(focus.segment, segments.length);
  const segment = segments[segmentIndex];
  const state = states.find((item) => item.id === segment?.interval?.stateId);
  const duration = domain.endMs - domain.startMs;
  const choose = () => {
    if (lane && segment?.interval) onIntervalSelect?.(lane.id, segment.interval);
  };
  const paths = new Map<string, { color: string; path: string }>();
  if (valid)
    prepared.forEach((items, row) =>
      items.forEach((item) => {
        const state = states.find((value) => value.id === item.interval?.stateId);
        const key = state ? `state:${state.id}` : 'unknown';
        const color = state ? toneColor(state.tone) : `url(#${id}-missing)`;
        const x = ((item.startMs - domain.startMs) / duration) * 600;
        const width = ((item.endMs - item.startMs) / duration) * 600;
        const previous = paths.get(key)?.path ?? '';
        paths.set(key, { color, path: `${previous}M${x},${row * 32 + 5}h${width}v22h${-width}Z` });
      }),
    );
  return (
    <div className={`${styles.Root} ${className ?? ''}`}>
      <div className={styles.Timeline}>
        <div className={styles.Lanes}>
          {lanes.map((item) => (
            <div key={item.id}>{item.label}</div>
          ))}
        </div>
        <svg
          className={styles.Plot}
          height={Math.max(32, lanes.length * 32)}
          viewBox={`0 0 600 ${Math.max(32, lanes.length * 32)}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
          aria-describedby={id}
          tabIndex={0}
          onPointerMove={(event) => {
            if (!valid || !lanes.length) return;
            const rect = event.currentTarget.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const row = clampIndex(
              Math.floor(((event.clientY - rect.top) / rect.height) * lanes.length),
              lanes.length,
            );
            const time = domain.startMs + ((event.clientX - rect.left) / rect.width) * duration;
            const index =
              prepared[row]?.findIndex((item) => time >= item.startMs && time < item.endMs) ?? -1;
            if (index >= 0) setFocus({ lane: row, segment: index });
          }}
          onClick={(event) => {
            if (!valid) return;
            const rect = event.currentTarget.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const row = Math.floor(((event.clientY - rect.top) / rect.height) * lanes.length);
            const clickedLane = lanes[row];
            const time = domain.startMs + ((event.clientX - rect.left) / rect.width) * duration;
            const clicked = prepared[row]?.find(
              (item) => time >= item.startMs && time < item.endMs,
            );
            if (clickedLane && clicked?.interval)
              onIntervalSelect?.(clickedLane.id, clicked.interval);
          }}
          onKeyDown={(event) => {
            if (
              [
                'ArrowRight',
                'ArrowLeft',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'Enter',
                ' ',
              ].includes(event.key)
            )
              event.preventDefault();
            if (event.key === 'ArrowRight')
              setFocus({ lane: laneIndex, segment: clampIndex(segmentIndex + 1, segments.length) });
            if (event.key === 'ArrowLeft')
              setFocus({ lane: laneIndex, segment: clampIndex(segmentIndex - 1, segments.length) });
            if (event.key === 'ArrowUp')
              setFocus({ lane: clampIndex(laneIndex - 1, lanes.length), segment: 0 });
            if (event.key === 'ArrowDown')
              setFocus({ lane: clampIndex(laneIndex + 1, lanes.length), segment: 0 });
            if (event.key === 'Home') setFocus({ lane: laneIndex, segment: 0 });
            if (event.key === 'End') setFocus({ lane: laneIndex, segment: segments.length - 1 });
            if (event.key === 'Enter' || event.key === ' ') choose();
          }}
        >
          <defs>
            <pattern id={`${id}-missing`} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 6L6 0" stroke="var(--ov-color-chart-missing)" />
            </pattern>
          </defs>
          {[...paths].map(([key, value]) => (
            <path key={key} d={value.path} fill={value.color} />
          ))}
          {valid && segment && (
            <rect
              x={((segment.startMs - domain.startMs) / duration) * 600}
              y={laneIndex * 32 + 4}
              width={((segment.endMs - segment.startMs) / duration) * 600}
              height="24"
              className={styles.Inspection}
            />
          )}
        </svg>
      </div>
      <div className={styles.Legend}>
        {states.map((item) => {
          const swatchStyle = { '--_timeline-tone': toneColor(item.tone) } as CSSProperties;
          return (
            <span key={item.id}>
              <i className={styles.StateSwatch} style={swatchStyle} />
              {item.label}
            </span>
          );
        })}
        <span>
          <i className={styles.Unknown} />
          Unknown
        </span>
      </div>
      <div id={id} className={styles.InspectionText} aria-live="polite">
        {segment && lane
          ? `${lane.label} · ${state?.label ?? 'Unknown'} · ${new Date(segment.startMs).toLocaleString()}–${new Date(segment.endMs).toLocaleTimeString()}`
          : 'No drawable intervals'}
      </div>
    </div>
  );
}
