import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './lib/amplify';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AgentsCatalog from './pages/AgentsCatalog';
import TestCaseAgent from './pages/TestCaseAgent';
import PlaywrightAgent from './pages/PlaywrightAgent';
import Login from './pages/Login';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agents" element={<AgentsCatalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/agents/test-case" element={<ProtectedRoute><TestCaseAgent /></ProtectedRoute>} />
        <Route path="/agents/playwright" element={<ProtectedRoute><PlaywrightAgent /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
