import { Container, Paper, Snackbar, Alert, Slide } from '@mui/material';
import { useCallback, useState } from 'react';
import api from '../api/axios';
import type { Movie } from '../types';
import SearchBar from '../components/Movies/SearchBar';
import FavoritesList from '../components/Movies/FavoritesList';
import MovieDialog from '../components/Movies/MovieDialog';

// Optional: transition for Snackbar for a snappier feel
function SlideUp(props: any) {
  return <Slide {...props} direction="up" />;
}

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success',
  });
  // Trigger for FavoritesList to refetch/refresh. Could be a number increment or a timestamp.
  const [favoritesVersion, setFavoritesVersion] = useState(0);

  const handleToastClose = useCallback(
    (_e?: unknown, reason?: string) => {
      if (reason === 'clickaway') return; // keep snackbar until timeout or close btn
      setToast((t) => ({ ...t, open: false }));
    },
    []
  );

  const onSearch = useCallback(async (title: string) => {
    const q = title.trim();
    if (!q) {
      setToast({ open: true, msg: 'Please enter a movie title', type: 'error' });
      return;
    }
    try {
      const { data } = await api.get(`/moviesapi/tmdb/search/${encodeURIComponent(q)}`);
      setSelected(data);
      setDialogOpen(true);
    } catch {
      setToast({ open: true, msg: 'Movie not found', type: 'error' });
    }
  }, []);

  const onAdd = useCallback(async (m: Movie) => {
    // Optimistic UX: close dialog and nudge list immediately
    setDialogOpen(false);
    setFavoritesVersion((v) => v + 1);
    setToast({ open: true, msg: 'Added to favourites', type: 'success' });

    try {
      await api.post('/moviesapi/addmovie', m);
      // Optionally bump again to refetch from server for consistency after success
      setFavoritesVersion((v) => v + 1);
    } catch {
      // Rollback signal: bump again so list can revert or refetch
      setFavoritesVersion((v) => v + 1);
      setToast({ open: true, msg: 'Failed to add', type: 'error' });
    }
  }, []);

  // If you keep Tailwind, keep it minimal to avoid clashes; otherwise switch to sx on MUI containers.
  const containerClass = 'py-6 space-y-6'; // Consider migrating to sx for consistency
  const paperClass = 'p-4';

  return (
    <Container className={containerClass}>
      <Paper className={paperClass}>
        <SearchBar onSearch={onSearch} />
      </Paper>

      {/* FavoritesList can use favoritesVersion as a key, dependency, or prop to refetch */}
      <FavoritesList version={favoritesVersion} />

      <MovieDialog
        open={dialogOpen}
        movie={selected}
        onClose={() => setDialogOpen(false)}
        onAdd={onAdd}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={handleToastClose}
        TransitionComponent={SlideUp}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity={toast.type} variant="filled" elevation={3}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
