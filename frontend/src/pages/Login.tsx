import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/agents');
  }, [user, navigate]);

  return (
    <div style={styles.page}>
      <Authenticator />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0f0f1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
};
