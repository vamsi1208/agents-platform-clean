import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🤖 AgentsPlatform</Link>
      <div style={styles.links}>
        <Link to="/agents" style={styles.link}>Agents</Link>
        {user && <Link to="/history" style={styles.link}>History</Link>}
        {user
          ? <button onClick={handleLogout} style={styles.btn}>Logout</button>
          : <Link to="/login" style={styles.btn}>Login</Link>
        }
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1a1a2e', color: '#fff' },
  brand: { color: '#e94560', fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none' },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: '#fff', textDecoration: 'none' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' },
};
