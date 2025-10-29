import {  Container, Paper, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import api from '../api/axios';
import type { Movie } from '../types';
import SearchBar from '../components/Movies/SearchBar';
import FavoritesList from '../components/Movies/FavoritesList';
import MovieDialog from '../components/Movies/MovieDialog';

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  const onSearch = async (title: string) => {
    if (!title.trim()) return;
    try {
      const { data } = await api.get(`/moviesapi/tmdb/search/${encodeURIComponent(title)}`);
      setSelected(data);
      setDialogOpen(true);
    } catch {
      setToast({ open: true, msg: 'Movie not found', type: 'error' });
    }
  };

  const onAdd = async (m: Movie) => {
    try {
      await api.post('/moviesapi/addmovie', m);
      setDialogOpen(false);
      setToast({ open: true, msg: 'Added to favourites', type: 'success' });
    } catch {
      setToast({ open: true, msg: 'Failed to add', type: 'error' });
    }
  };

  return (
    <Container className="py-6 space-y-6">
      <Paper className="p-4">
        <SearchBar onSearch={onSearch} />
      </Paper>

      <FavoritesList />

      <MovieDialog open={dialogOpen} movie={selected} onClose={() => setDialogOpen(false)} onAdd={onAdd} />

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
