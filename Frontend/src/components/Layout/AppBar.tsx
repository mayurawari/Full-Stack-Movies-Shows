import { AppBar as MAppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AppBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <MAppBar position="sticky" color="default" elevation={1}>
      <Toolbar className="flex justify-between">
        <Typography variant="h6" className="cursor-pointer" onClick={() => navigate('/')}>
          Movie Vault
        </Typography>
        <Box className="flex items-center gap-2">
          {user ? (
            <>
              <Typography variant="body2">Hello, {user.username}</Typography>
              <Button variant="outlined" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => navigate('/auth')}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </MAppBar>
  );
}
