import { AppBar as MAppBar, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppBar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLoginClick = () => {
    if (location.pathname !== '/auth') navigate('/auth');
  };

  return (
    <MAppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: '#000', // true black navbar
        color: '#fff',
        borderBottom: '1px solid #111',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: 56, sm: 64 },
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', fontWeight: 700, letterSpacing: 0.3, '&:hover': { opacity: 0.85 } }}
        >
          Movies
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {token ? (
            <>
              <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                Hello, {user?.username || 'User'}
              </Typography>
              <Button
                variant="outlined"
                onClick={logout}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#555',
                  color: '#fff',         // ensure white text on black
                  '&:hover': { borderColor: '#777', backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={onLoginClick}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>
    </MAppBar>
  );
}
