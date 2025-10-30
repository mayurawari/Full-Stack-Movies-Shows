import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography, Chip, Box } from '@mui/material';
import type { Movie } from '../../types';

type Props = { open: boolean; movie: Movie | null; onClose: () => void; onAdd: (m: Movie) => void; };

export default function MovieDialog({ open, movie, onClose, onAdd }: Props) {
  if (!movie) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{movie.title || 'Untitled'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            {movie.poster ? (
              <Box component="img" src={movie.poster} alt={movie.title} sx={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 1.5 }} />
            ) : <Box sx={{ width: '100%', aspectRatio: '2 / 3', borderRadius: 1.5 }} />}
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {movie.type && <Chip label={movie.type} size="small" />}
              {movie.year && <Typography variant="body2" color="text.secondary">{movie.year}</Typography>}
              {movie.duration && <Typography variant="body2" color="text.secondary">{movie.duration}</Typography>}
            </Box>
            <Field label="Director" value={movie.director} />
            <Field label="Budget" value={movie.budget} />
            <Field label="Location" value={movie.location} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => onAdd(movie)}>Add to favourites</Button>
      </DialogActions>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
