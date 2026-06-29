import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: string;
}

export default function AgentCard({ title, description, icon, route, badge }: Props) {
  const navigate = useNavigate();
  return (
    <div style={styles.card} onClick={() => navigate(route)}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.desc}>{description}</p>
      {badge && <span style={styles.badge}>{badge}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', minWidth: '220px', maxWidth: '280px' },
  icon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  title: { color: '#fff', margin: '0 0 0.5rem', fontSize: '1.1rem' },
  desc: { color: '#aaa', margin: '0 0 1rem', fontSize: '0.9rem', lineHeight: 1.5 },
  badge: { background: '#e94560', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '20px' },
};
