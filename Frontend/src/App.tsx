import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import AppBar from './components/Layout/AppBar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import { CssBaseline } from '@mui/material';

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <BrowserRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
