import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className="py-10">
      <Paper elevation={3} className="p-6">
        <Typography variant="h5" className="mb-4 text-center">Sign in</Typography>
        <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-3">
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </Box>
      </Paper>
    </Container>
  );
}
