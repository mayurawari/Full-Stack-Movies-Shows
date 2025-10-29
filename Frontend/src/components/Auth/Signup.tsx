import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<{ username?: string; email?: string; password?: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await signup(username, email, password);
      nav('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#000' : '#fff'),
      }}
    >
      <Paper
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: 480,
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4.5 },
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
          border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#222' : '#e5e5e5'}`,
        }}
        aria-label="Create account panel"
      >
        <Stack spacing={2.5}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.2,
              color: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
            }}
          >
            Create account
          </Typography>

          <Box
            component="form"
            onSubmit={onSubmit}
            noValidate
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: '1fr',
            }}
            aria-labelledby="signup-title"
            role="form"
          >
            <Typography id="signup-title" sx={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
              Signup form
            </Typography>

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              fullWidth
              size="medium"
              variant="outlined"
              inputProps={{ 'aria-label': 'Username', maxLength: 40 }}
              error={Boolean(errors.username)}
              helperText={errors.username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f0f0f' : '#fff'),
                },
              }}
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              fullWidth
              size="medium"
              variant="outlined"
              inputProps={{ inputMode: 'email', 'aria-label': 'Email address' }}
              error={Boolean(errors.email)}
              helperText={errors.email}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f0f0f' : '#fff'),
                },
              }}
            />

            <TextField
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              fullWidth
              size="medium"
              variant="outlined"
              inputProps={{ minLength: 8, 'aria-label': 'Password' }}
              error={Boolean(errors.password)}
              helperText={errors.password || 'Use 8+ characters.'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f0f0f' : '#fff'),
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPwd((s) => !s)}
                      edge="end"
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              size="large"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
                color: (t) => (t.palette.mode === 'dark' ? '#111' : '#fff'),
                '&:hover': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#d5d5d5' : '#000'),
                },
                '&.Mui-disabled': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#2a2a2a' : '#cfcfcf'),
                  color: (t) => (t.palette.mode === 'dark' ? '#6f6f6f' : '#7a7a7a'),
                },
              }}
            >
              {loading ? (
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <CircularProgress size={18} thickness={5} />
                  <span>Signing up...</span>
                </Stack>
              ) : (
                'Sign up'
              )}
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: (t) => (t.palette.mode === 'dark' ? '#bdbdbd' : '#6b6b6b'), mt: 0.5 }}
            >
              Choose a unique username and a strong password.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
