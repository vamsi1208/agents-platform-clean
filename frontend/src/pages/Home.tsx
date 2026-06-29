import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heading}>AI Agents Platform</h1>
        <p style={styles.sub}>Supercharge your workflow with AI-powered agents built on AWS Bedrock</p>
        <button style={styles.cta} onClick={() => navigate('/agents')}>Explore Agents →</button>
      </div>

      <div style={styles.features}>
        {[
          { icon: '🧪', title: 'Test Case Agent', desc: 'Generate structured test cases from feature descriptions instantly' },
          { icon: '🎭', title: 'Playwright Agent', desc: 'Generate ready-to-run Playwright scripts from user journeys' },
          { icon: '🔒', title: 'Secure & Private', desc: 'Authenticated via AWS Cognito, all data stored in your AWS account' },
          { icon: '⚡', title: 'Powered by Bedrock', desc: 'Claude on Amazon Bedrock — fast, reliable, and cost-effective' },
        ].map((f) => (
          <div key={f.title} style={styles.card}>
            <div style={styles.cardIcon}>{f.icon}</div>
            <h3 style={styles.cardTitle}>{f.title}</h3>
            <p style={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0f0f1a', minHeight: '100vh', color: '#fff' },
  hero: { textAlign: 'center', padding: '6rem 2rem 4rem' },
  heading: { fontSize: '3rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem' },
  sub: { fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 2rem' },
  cta: { background: '#e94560', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 },
  features: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', padding: '2rem' },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: '12px', padding: '2rem', maxWidth: '260px', textAlign: 'center' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  cardTitle: { color: '#fff', margin: '0 0 0.5rem' },
  cardDesc: { color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 },
};
