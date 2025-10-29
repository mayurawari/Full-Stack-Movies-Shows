import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(username, email, password);
      nav('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className="py-10">
      <Paper elevation={3} className="p-6">
        <Typography variant="h5" className="mb-4 text-center">Create account</Typography>
        <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-3">
          <TextField label="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</Button>
        </Box>
      </Paper>
    </Container>
  );
}
