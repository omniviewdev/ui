import { LuShieldAlert } from 'react-icons/lu';
import styles from '../index.module.css';

export interface ErrorPageProps {
  url: string;
  onNewTab: () => void;
}

export function ErrorPage({ url, onNewTab }: ErrorPageProps) {
  return (
    <div className={styles.errorPage}>
      <LuShieldAlert size={48} className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>This site cannot be displayed in a frame</h2>
      <p className={styles.errorUrl}>{url}</p>
      <button type="button" className={styles.errorButton} onClick={onNewTab}>
        New Tab
      </button>
    </div>
  );
}
