import { Suspense, useState } from 'react';
import { Spinner } from '@omniview/base-ui';
import { apps } from './registry';
import { Dock } from './Dock';
import { Home } from './Home';
import styles from './App.module.css';

export function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const activeDemo = apps.find((a) => a.id === activeApp);

  return (
    <div className={styles.shell}>
      <Dock activeApp={activeApp} onSelectApp={setActiveApp} />
      <main className={styles.content}>
        {activeDemo ? (
          <Suspense fallback={<Spinner />}>
            <activeDemo.component />
          </Suspense>
        ) : (
          <Home onSelectApp={setActiveApp} />
        )}
      </main>
    </div>
  );
}
