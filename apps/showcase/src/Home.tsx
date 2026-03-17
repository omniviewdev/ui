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

      <Card.Group columns={3} className={styles.grid}>
        {apps.map((app) => (
          <Card key={app.id} size="sm">
            <Card.ActionArea onClick={() => onSelectApp(app.id)}>
              <Card.Header>
                <div className={styles.cardRow}>
                  <div className={styles.iconBox}>
                    <app.icon />
                  </div>
                  <div>
                    <Card.Title>{app.name}</Card.Title>
                    <Card.Description>{app.description}</Card.Description>
                  </div>
                </div>
              </Card.Header>
            </Card.ActionArea>
          </Card>
        ))}
      </Card.Group>
    </div>
  );
}
