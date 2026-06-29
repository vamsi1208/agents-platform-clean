import AgentCard from '../components/AgentCard';

const AGENTS = [
  { title: 'Test Case Agent', description: 'Generate comprehensive test cases in Given/When/Then format from a feature description or user story.', icon: '🧪', route: '/agents/test-case', badge: 'Live' },
  { title: 'Playwright Agent', description: 'Generate ready-to-run Playwright TypeScript test scripts from a URL or user journey description.', icon: '🎭', route: '/agents/playwright', badge: 'Live' },
  { title: 'API Test Agent', description: 'Generate REST API tests from OpenAPI/Swagger specs automatically.', icon: '🔌', route: '#', badge: 'Coming Soon' },
  { title: 'Bug Report Agent', description: 'Convert logs and error descriptions into structured, actionable bug reports.', icon: '🐛', route: '#', badge: 'Coming Soon' },
];

export default function AgentsCatalog() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Agents Catalog</h1>
      <p style={styles.sub}>Choose an agent to get started</p>
      <div style={styles.grid}>
        {AGENTS.map((a) => <AgentCard key={a.title} {...a} />)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '3rem 2rem', color: '#fff' },
  title: { textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' },
  sub: { textAlign: 'center', color: '#aaa', marginBottom: '2.5rem' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' },
};
