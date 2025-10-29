import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import type { Movie } from '../../types';
import ManualMovieForm from './ManualMovieForm';

export default function FavoritesList() {
  const [items, setItems] = useState<Movie[]>([]);
  const [limit] = useState(10);
  const [offset] = useState(0);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: number }>({ open: false });

  const fetchAll = async () => {
    const { data } = await api.get('/moviesapi/allmovies', { params: { limit, offset } });
    setItems(data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onCreate = async (m: Movie) => {
    const { data } = await api.post('/moviesapi/addmovie', m);
    setItems((p) => [data, ...p]);
  };

  const onUpdate = async (m: Movie) => {
    if (!m.id) return;
    const { data } = await api.put(`/moviesapi/updatemovie/${m.id}`, m);
    setItems((p) => p.map((x) => (x.id === m.id ? data : x)));
    setEditing(null);
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    await api.delete(`/moviesapi/deletemovie/${id}`);
    setItems((p) => p.filter((x) => x.id !== id));
    setConfirm({ open: false });
  };

  const rows = useMemo(() => items, [items]);

  return (
    <Box className="space-y-6">
      <ManualMovieForm onSubmit={onCreate} submitLabel="Add movie" />

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table stickyHeader size="small" aria-label="movies table">
          <TableHead>
            <TableRow>
              <TableCell>Poster</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Director</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((m) => (
              <TableRow hover key={`${m.id}-${m.title}`}>
                <TableCell sx={{ minWidth: 80 }}>
                  {m.poster ? (
                    <img
                      src={m.poster}
                      alt={m.title}
                      style={{ width: 48, height: 72, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : (
                    <Box sx={{ width: 48, height: 72, bgcolor: 'action.hover', borderRadius: 1 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={m.title}>
                    {m.title}
                  </Typography>
                </TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={m.director}>
                    {m.director}
                  </Typography>
                </TableCell>
                <TableCell>{m.year}</TableCell>
                <TableCell>{m.duration}</TableCell>
                <TableCell>{m.budget}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={m.location}>
                    {m.location}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditing(m)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirm({ open: true, id: m.id })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center" variant="body2" sx={{ py: 3 }}>
                    No movies yet. Use the form above or add from TMDB search.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit movie</DialogTitle>
        <DialogContent>
          {editing && (
            <ManualMovieForm
              initial={editing}
              onSubmit={onUpdate}
              submitLabel="Update"
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false })}>
        <DialogTitle>Delete this movie?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => onDelete(confirm.id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
