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
  Typography,
  Stack,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import api from '../../api/axios';
import type { Movie } from '../../types';
import ManualMovieForm from './ManualMovieForm';
interface FavoritesListProps {
  version: number;
}
export default function FavoritesList({ version }: FavoritesListProps) {
  const [items, setItems] = useState<Movie[]>([]);
  const [limit] = useState(10); // fixed page size
  const [offset, setOffset] = useState(0); // current next offset
  const [editing, setEditing] = useState<Movie | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: number }>({ open: false });

  // Filter modal state (unchanged)
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<{ title: string; type: string; yearMin: string; yearMax: string }>({
    title: '',
    type: '',
    yearMin: '',
    yearMax: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);

  // Infinite scroll state
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Fetch a page by offset, append if offset>0 else replace
  const fetchPage = useCallback(
    async (nextOffset: number) => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/moviesapi/allmovies', { params: { limit, offset: nextOffset } });
        const list: Movie[] = Array.isArray(data) ? data : [];
        setItems((prev) => (nextOffset === 0 ? list : [...prev, ...list]));
        setHasMore(list.length === limit);
        setOffset(nextOffset + list.length);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // Initial load
  useEffect(() => {
    fetchPage(0);
    console.log(version)
  }, [fetchPage]);

  // Optional: refresh from server when filters change (keeps client-side filter logic intact)
  useEffect(() => {
    fetchPage(0);
  }, [appliedFilters, fetchPage]);

  // CRUD handlers (unchanged)
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

  // Apply simple client-side filters (unchanged)
  const rows = useMemo(() => {
    const f = appliedFilters;
    const titleQ = f.title.trim().toLowerCase();
    const typeQ = f.type.trim().toLowerCase();
    const yMin = f.yearMin ? parseInt(f.yearMin, 10) : undefined;
    const yMax = f.yearMax ? parseInt(f.yearMax, 10) : undefined;

    return items.filter((m) => {
      const okTitle = titleQ ? (m.title || '').toLowerCase().includes(titleQ) : true;
      const okType = typeQ ? (m.type || '').toLowerCase() === typeQ : true;
      const y = typeof m.year === 'number' ? m.year : parseInt(String(m.year || ''), 10);
      const okYearMin = yMin !== undefined ? (!isNaN(y) && y >= yMin) : true;
      const okYearMax = yMax !== undefined ? (!isNaN(y) && y <= yMax) : true;
      return okTitle && okType && okYearMin && okYearMax;
    });
  }, [items, appliedFilters]);

  // Infer type options from current items (unchanged)
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((m) => m.type && set.add(m.type));
    return Array.from(set);
  }, [items]);

  // IntersectionObserver for sentinel to load next page
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoading && hasMore) {
          fetchPage(offset);
        }
      },
      {
        // Ensure we observe within the scrolling TableContainer
        root: node.parentElement?.parentElement || null, // tbody -> table -> container
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [offset, hasMore, isLoading, fetchPage]);

  // Helpers for modal actions (unchanged)
  const resetDraft = () => setDraftFilters({ title: '', type: '', yearMin: '', yearMax: '' });
  const openFilter = () => {
    setDraftFilters(appliedFilters);
    setFilterOpen(true);
  };
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFilterOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#111' : '#fafafa'),
          borderColor: (t) => (t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: 0.2,
            color: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
          }}
        >
          Add movie
        </Typography>

        <ManualMovieForm onSubmit={onCreate} submitLabel="Add movie" />
      </Paper>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Favourites
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={openFilter}
          sx={{ borderRadius: 2 }}
          aria-label="Open filters"
        >
          Filters
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f0f0f' : '#fff'),
          overflow: 'auto',
          maxHeight: { xs: 480, sm: 560, md: 640 },
        }}
      >
        <Table
          stickyHeader
          size="small"
          aria-label="movies table"
          sx={{
            tableLayout: 'fixed',
            '& thead th': {
              fontWeight: 700,
              letterSpacing: 0.2,
              bgcolor: (t) => (t.palette.mode === 'dark' ? '#131313' : '#f5f5f5'),
              color: (t) => (t.palette.mode === 'dark' ? '#dcdcdc' : '#222'),
              borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
            },
            '& tbody tr:nth-of-type(odd)': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d0d0d' : '#fafafa'),
            },
            '& tbody tr:hover': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? '#171717' : '#f0f0f0'),
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 84 }}>Poster</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Title</TableCell>
              <TableCell sx={{ width: 110 }}>Type</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Director</TableCell>
              <TableCell sx={{ width: 90 }} align="right">
                Year
              </TableCell>
              <TableCell sx={{ width: 110 }} align="right">
                Duration
              </TableCell>
              <TableCell sx={{ width: 110 }} align="right">
                Budget
              </TableCell>
              <TableCell sx={{ minWidth: 160 }}>Location</TableCell>
              <TableCell sx={{ width: 110 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((m) => (
              <TableRow
                hover
                key={`${m.id}-${m.title}`}
                sx={{ '& td': { borderColor: (t) => (t.palette.mode === 'dark' ? '#1a1a1a' : '#eee') } }}
              >
                <TableCell>
                  {m.poster ? (
                    <Box
                      component="img"
                      src={m.poster}
                      alt={m.title}
                      sx={{
                        width: 48,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 1,
                        display: 'block',
                        border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'}`,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 72,
                        bgcolor: (t) => (t.palette.mode === 'dark' ? '#161616' : '#f1f1f1'),
                        borderRadius: 1,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap title={m.title}>
                    {m.title}
                  </Typography>
                </TableCell>

                <TableCell>
                  {m.type ? (
                    <Chip
                      label={m.type}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        fontWeight: 600,
                        bgcolor: (t) => (t.palette.mode === 'dark' ? '#1a1a1a' : '#f2f2f2'),
                        color: (t) => (t.palette.mode === 'dark' ? '#d0d0d0' : '#222'),
                        border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#232323' : '#e0e0e0'}`,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap title={m.director}>
                    {m.director}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">{m.year || '—'}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">{m.duration || '—'}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">{m.budget || '—'}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap title={m.location}>
                    {m.location}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      aria-label={`Edit ${m.title}`}
                      onClick={() => setEditing(m)}
                      sx={{
                        border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#232323' : '#e0e0e0'}`,
                        bgcolor: (t) => (t.palette.mode === 'dark' ? '#121212' : '#fff'),
                        '&:hover': { bgcolor: (t) => (t.palette.mode === 'dark' ? '#181818' : '#f7f7f7') },
                      }}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>

                    <IconButton
                      size="small"
                      aria-label={`Delete ${m.title}`}
                      onClick={() => setConfirm({ open: true, id: m.id })}
                      sx={{
                        border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#232323' : '#e0e0e0'}`,
                        bgcolor: (t) => (t.palette.mode === 'dark' ? '#121212' : '#fff'),
                        color: (t) => (t.palette.mode === 'dark' ? '#ff6b6b' : '#b00020'),
                        '&:hover': { bgcolor: (t) => (t.palette.mode === 'dark' ? '#181818' : '#f7f7f7') },
                      }}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {/* loading indicator row */}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box sx={{ py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* sentinel row to trigger loading next page */}
            {hasMore && (
              <TableRow ref={sentinelRef}>
                <TableCell colSpan={9} />
              </TableRow>
            )}

            {/* empty state */}
            {rows.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No movies yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the form above or add from TMDB search.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit dialog */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
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
          }}
        >
          Edit movie
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
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

      {/* Delete confirm dialog */}
      <Dialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false })}
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
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.2, pb: 1 }}>
          Delete this movie?
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Typography variant="body2">This action can’t be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirm({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => onDelete(confirm.id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter dialog */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.2, pb: 1 }}>Filters</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title contains"
              size="small"
              value={draftFilters.title}
              onChange={(e) => setDraftFilters((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., Inception"
            />
            <TextField
              label="Type"
              size="small"
              select
              value={draftFilters.type}
              onChange={(e) => setDraftFilters((s) => ({ ...s, type: e.target.value }))}
            >
              <MenuItem value="">Any</MenuItem>
              {typeOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Year min"
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={draftFilters.yearMin}
                onChange={(e) => setDraftFilters((s) => ({ ...s, yearMin: e.target.value }))}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Year max"
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={draftFilters.yearMax}
                onChange={(e) => setDraftFilters((s) => ({ ...s, yearMax: e.target.value }))}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={resetDraft}>Clear</Button>
          <Button variant="contained" onClick={applyFilters}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

