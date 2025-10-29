import { AppBar as MAppBar, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppBar() {
  const { user, token, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const onLoginClick = () => {
    if (location.pathname !== '/auth') navigate('/auth');
  };

  return (
    <MAppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
        color: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
        borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? '#222' : '#e5e5e5'}`,
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
          sx={{
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: 0.3,
            color: 'inherit',
            '&:hover': { opacity: 0.85 },
          }}
        >
          Movies
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {token ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: (t) => (t.palette.mode === 'dark' ? '#bdbdbd' : '#4a4a4a') }}
              >
                Hello, {user?.username || 'User'}
              </Typography>

              <Button
                variant="outlined"
                onClick={logout}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: (t) => (t.palette.mode === 'dark' ? '#333' : '#cfcfcf'),
                  color: 'inherit',
                  bgcolor: 'transparent',
                  '&:hover': {
                    borderColor: (t) => (t.palette.mode === 'dark' ? '#444' : '#bdbdbd'),
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#161616' : '#f2f2f2'),
                  },
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
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
                color: (t) => (t.palette.mode === 'dark' ? '#111' : '#fff'),
                '&:hover': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#d5d5d5' : '#000'),
                },
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
