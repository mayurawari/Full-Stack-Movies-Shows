import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Chip,
  Box,
} from '@mui/material';
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f0f0f' : '#fff'),
          border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
        },
        '& .MuiBackdrop-root': {
          backgroundColor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)'),
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          letterSpacing: 0.2,
          pb: 1,
          pr: { xs: 2, sm: 3 },
        }}
      >
        {movie.title || 'Untitled'}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            {movie.poster ? (
              <Box
                component="img"
                src={movie.poster}
                alt={movie.title}
                sx={{
                  width: '100%',
                  aspectRatio: '2 / 3',
                  objectFit: 'cover',
                  borderRadius: 1.5,
                  border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '2 / 3',
                  borderRadius: 1.5,
                  border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
                }}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {movie.type && (
                <Chip
                  label={movie.type}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 600,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#1a1a1a' : '#f2f2f2'),
                    color: (t) => (t.palette.mode === 'dark' ? '#d0d0d0' : '#222'),
                    border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#232323' : '#e0e0e0'}`,
                  }}
                />
              )}
              {movie.year && (
                <Typography variant="body2" color="text.secondary">
                  {movie.year}
                </Typography>
              )}
              {movie.duration && (
                <Typography variant="body2" color="text.secondary">
                  • {movie.duration}
                </Typography>
              )}
            </Box>

            <Info label="Director" value={movie.director} />
            <Info label="Budget" value={movie.budget} />
            <Info label="Location" value={movie.location} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => onAdd(movie)}
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
          Add to favourites
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );
}
