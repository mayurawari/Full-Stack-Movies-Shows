import { Box, Button, Grid, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { Movie } from '../../types';

type Props = {
  initial?: Movie | null;
  onSubmit: (m: Movie) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function ManualMovieForm({ initial, onSubmit, onCancel, submitLabel = 'Add movie' }: Props) {
  const [form, setForm] = useState<Movie>({
    title: '',
    type: 'Movie',
    director: '',
    budget: '',
    location: '',
    duration: '',
    year: '',
    poster: '',
  });

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const update = (k: keyof Movie, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    if (!initial) {
      setForm({ title: '', type: 'Movie', director: '', budget: '', location: '', duration: '', year: '', poster: '' });
    }
  };

  return (
    <Paper className="p-4">
      <Typography variant="h6" className="mb-3">{submitLabel === 'Update' ? 'Edit movie' : 'Manual entry'}</Typography>
      <Box component="form" onSubmit={handle}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField label="Title" fullWidth required value={form.title} onChange={(e)=>update('title', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ToggleButtonGroup
              exclusive
              value={form.type}
              onChange={(_, v) => v && update('type', v)}
              fullWidth
              color="primary"
              size="small"
            >
              <ToggleButton value="Movie">Movie</ToggleButton>
              <ToggleButton value="Series">Series</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Director" fullWidth value={form.director} onChange={(e)=>update('director', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Budget" fullWidth value={form.budget} onChange={(e)=>update('budget', e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Location" fullWidth value={form.location} onChange={(e)=>update('location', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Duration" fullWidth value={form.duration} onChange={(e)=>update('duration', e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Year" fullWidth value={form.year} onChange={(e)=>update('year', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Poster URL" fullWidth value={form.poster} onChange={(e)=>update('poster', e.target.value)} />
          </Grid>
        </Grid>

        <Box className="mt-4 flex gap-2">
          <Button type="submit" variant="contained">{submitLabel}</Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Box>
      </Box>
    </Paper>
  );
}
