import { Typography, Card } from '@omniview/base-ui';
import { apps } from './registry';
import styles from './Home.module.css';

interface HomeProps {
  onSelectApp: (id: string) => void;
}

export function Home({ onSelectApp }: HomeProps) {
  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <Typography.Heading level={1}>Omniview Showcase</Typography.Heading>
        <Typography tone="muted">
          Interactive demos built entirely with Omniview UI
        </Typography>
      </div>

      <div className={styles.grid}>
        {apps.map((app) => (
          <Card
            key={app.id}
            className={styles.card}
            onClick={() => onSelectApp(app.id)}
          >
            <div className={styles.cardContent}>
              <div className={styles.iconBox}>
                <app.icon />
              </div>
              <div className={styles.cardText}>
                <Typography weight="semibold">{app.name}</Typography>
                <Typography.Caption>{app.description}</Typography.Caption>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
