import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';

interface Props {
  title: string;
  icon: string;
  placeholder: string;
  endpoint: string;
  outputLabel: string;
}

export default function AgentPage({ title, icon, placeholder, endpoint, outputLabel }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    setError('');
    try {
      const res = await api.post(endpoint, { input });
      setOutput(res.data.output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.inputBox}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={6}
        />
        <button style={styles.btn} onClick={handleGenerate} disabled={loading || !input.trim()}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {output && (
        <div style={styles.outputBox}>
          <div style={styles.outputHeader}>
            <span style={styles.outputLabel}>{outputLabel}</span>
            <button style={styles.copyBtn} onClick={handleCopy}>Copy</button>
          </div>
          <div style={styles.outputContent}>
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '3rem 2rem', color: '#fff', maxWidth: '860px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
  icon: { fontSize: '2.5rem' },
  title: { fontSize: '1.8rem', margin: 0 },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  textarea: { background: '#16213e', border: '1px solid #0f3460', borderRadius: '8px', color: '#fff', padding: '1rem', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' },
  error: { color: '#e94560', marginBottom: '1rem' },
  outputBox: { background: '#16213e', border: '1px solid #0f3460', borderRadius: '8px', overflow: 'hidden' },
  outputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#0f3460' },
  outputLabel: { fontWeight: 600, color: '#fff' },
  copyBtn: { background: 'transparent', color: '#aaa', border: '1px solid #aaa', padding: '0.2rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  outputContent: { padding: '1rem 1.5rem', color: '#ddd', lineHeight: 1.7, overflowX: 'auto' },
};
