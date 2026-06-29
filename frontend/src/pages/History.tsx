import { useEffect, useState } from 'react';
import api from '../lib/api';

interface Session {
  sessionId: string;
  agentType: string;
  input: string;
  output: string;
  createdAt: string;
}

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/agents/history')
      .then((r) => setSessions(r.data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.page}><p style={{ color: '#aaa' }}>Loading history...</p></div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Session History</h1>
      {sessions.length === 0
        ? <p style={{ color: '#aaa' }}>No sessions yet. Try an agent!</p>
        : sessions.map((s) => (
          <div key={s.sessionId} style={styles.card}>
            <div style={styles.cardHeader} onClick={() => setExpanded(expanded === s.sessionId ? null : s.sessionId)}>
              <span style={styles.badge}>{s.agentType}</span>
              <span style={styles.input}>{s.input.slice(0, 80)}...</span>
              <span style={styles.date}>{new Date(s.createdAt).toLocaleString()}</span>
            </div>
            {expanded === s.sessionId && (
              <pre style={styles.output}>{s.output}</pre>
            )}
          </div>
        ))
      }
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '3rem 2rem', color: '#fff', maxWidth: '860px', margin: '0 auto' },
  title: { fontSize: '1.8rem', marginBottom: '2rem' },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' },
  badge: { background: '#e94560', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap' },
  input: { color: '#ddd', flex: 1, fontSize: '0.9rem' },
  date: { color: '#666', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  output: { padding: '1rem', borderTop: '1px solid #0f3460', color: '#aaa', fontSize: '0.85rem', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' },
};
