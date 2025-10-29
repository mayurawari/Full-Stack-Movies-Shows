import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import type { Movie } from '../../types';

type Props = {
  open: boolean;
  movie: Movie | null;
  onClose: () => void;
  onAdd: (m: Movie) => void;
};

export default function MovieDialog({ open, movie, onClose, onAdd }: Props) {
  if (!movie) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{movie.title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <img src={movie.poster} alt={movie.title} style={{ width: '100%', borderRadius: 8 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography>Type: {movie.type}</Typography>
            <Typography>Director: {movie.director}</Typography>
            <Typography>Budget: {movie.budget}</Typography>
            <Typography>Location: {movie.location}</Typography>
            <Typography>Duration: {movie.duration}</Typography>
            <Typography>Year: {movie.year}</Typography>
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
