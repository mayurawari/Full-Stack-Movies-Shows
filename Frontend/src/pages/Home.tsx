import { Container, Paper, Snackbar, Alert, Slide } from '@mui/material';
import { useCallback, useState } from 'react';
import api from '../api/axios';
import type { Movie } from '../types';
import SearchBar from '../components/Movies/SearchBar';
import FavoritesList from '../components/Movies/FavoritesList';
import MovieDialog from '../components/Movies/MovieDialog';

function SlideUp(props: any) { return <Slide {...props} direction="up" />; }

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });
  const [favoritesVersion, setFavoritesVersion] = useState(0);

  const handleToastClose = useCallback((_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast((t) => ({ ...t, open: false }));
  }, []);

  const onSearch = useCallback(async (title: string) => {
    const q = title.trim();
    if (!q) { setToast({ open: true, msg: 'Please enter a movie title', type: 'error' }); return; }
    try {
      const { data } = await api.get(`/moviesapi/tmdb/search/${encodeURIComponent(q)}`);
      setSelected(data);
      setDialogOpen(true);
    } catch {
      setToast({ open: true, msg: 'Movie not found', type: 'error' });
    }
  }, []);

  const onAdd = useCallback(async (m: Movie) => {
    try {
      const { id, ...payload } = m;
      await api.post('/moviesapi/addmovie', payload);
      setToast({ open: true, msg: 'Added to favourites', type: 'success' });
      setDialogOpen(false);
      setFavoritesVersion((v) => v + 1); // bump once after success
    } catch {
      setToast({ open: true, msg: 'Failed to add', type: 'error' });
    }
  }, []);

  return (
    <Container sx={{ py: 6, display: 'grid', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <SearchBar onSearch={onSearch} />
      </Paper>

      <FavoritesList version={favoritesVersion} />

      <MovieDialog open={dialogOpen} movie={selected} onClose={() => setDialogOpen(false)} onAdd={onAdd} />

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={handleToastClose} TransitionComponent={SlideUp} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleToastClose} severity={toast.type} variant="filled" elevation={3}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
