import type { InspectorDiagnostic, InspectorEvidence, IndexFootprint } from './types';
import styles from './ResourceInspectorControls.module.css';

export function Evidence({ evidence }: { evidence: InspectorEvidence }) {
  const prefix =
    evidence.kind === 'actual'
      ? 'Observed'
      : evidence.kind === 'estimated'
        ? 'Estimated'
        : 'Unavailable';
  return (
    <div>
      <p>
        {prefix}: {evidence.value}
      </p>
      <p className={styles.Basis}>
        {evidence.label} · {evidence.basis}
      </p>
    </div>
  );
}

export function Footprint({ footprint }: { footprint: IndexFootprint }) {
  if ('reason' in footprint) {
    return (
      <p>
        {footprint.kind === 'unavailable' ? 'Unavailable' : 'Not applicable'}: {footprint.reason}
      </p>
    );
  }
  return (
    <div>
      <p>
        {footprint.kind === 'actual' ? 'Actual' : 'Estimated'}: {footprint.value}
      </p>
      <p className={styles.Basis}>{footprint.basis}</p>
    </div>
  );
}

export function Diagnostics({ diagnostics }: { diagnostics: readonly InspectorDiagnostic[] }) {
  return diagnostics.length > 0 ? (
    <ul className={styles.List} aria-label="Diagnostics">
      {diagnostics.map((diagnostic) => (
        <li
          key={diagnostic.id}
          className={diagnostic.severity === 'error' ? styles.Error : undefined}
        >
          <strong>{diagnostic.severity}: </strong>
          {diagnostic.message}
        </li>
      ))}
    </ul>
  ) : null;
}
