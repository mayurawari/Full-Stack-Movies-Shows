import {
  Box,
  Button,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useEffect, useMemo, useState } from 'react';
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

  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setExpanded(true);
    }
  }, [initial]);

  const title = useMemo(
    () => (submitLabel === 'Update' ? 'Edit movie' : 'Manual entry'),
    [submitLabel]
  );

  const update = (k: keyof Movie, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    if (!initial) {
      setForm({ title: '', type: 'Movie', director: '', budget: '', location: '', duration: '', year: '', poster: '' });
      setExpanded(false);
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, v) => setExpanded(v)}
      disableGutters
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          px: 2,
          py: 1,
          minHeight: 48,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1.5,
            my: 0.5,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.2,
            color: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
          }}
        >
          {title}
        </Typography>
        {!expanded && (
          <Typography variant="body2" color="text.secondary">
            Quick add a title, type, and more
          </Typography>
        )}
        {expanded && onCancel && (
          <IconButton
            aria-label="Close"
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.();
              setExpanded(false);
            }}
            sx={{ ml: 'auto' }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box component="form" onSubmit={handle}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <ToggleButtonGroup
                exclusive
                value={form.type}
                onChange={(_, v) => v && update('type', v)}
                fullWidth
                size="small"
                sx={{
                  borderRadius: 1,
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: (t) => (t.palette.mode === 'dark' ? '#232323' : '#e0e0e0'),
                  },
                }}
              >
                <ToggleButton value="Movie">Movie</ToggleButton>
                <ToggleButton value="Series">Series</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Director"
                fullWidth
                value={form.director}
                onChange={(e) => update('director', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Budget"
                fullWidth
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location"
                fullWidth
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Duration"
                fullWidth
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Year"
                fullWidth
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Poster URL"
                fullWidth
                value={form.poster}
                onChange={(e) => update('poster', e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              type="submit"
              variant="contained"
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
              {submitLabel}
            </Button>
            {onCancel && (
              <Button
                onClick={() => {
                  onCancel?.();
                  setExpanded(false);
                }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
