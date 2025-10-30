import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  DialogContentText,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "../../api/axios";
import type { Movie } from "../../types";
import ManualMovieForm from "./ManualMovieForm";

interface FavoritesListProps {
  version?: number;
}

const SERVER_FILTERS = false; // set true to query server with filters

export default function FavoritesList({ version }: FavoritesListProps) {
  const [items, setItems] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [editing, setEditing] = useState<Movie | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: number }>({
    open: false,
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    title: "",
    type: "",
    yearMin: "",
    yearMax: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    title: "",
    type: "",
    yearMin: "",
    yearMax: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Guards for infinite scroll
  const inFlightRef = useRef(false);
  const lastKeyRef = useRef<string>("");

  const filterKey = useMemo(() => {
    return `${appliedFilters.title}|${appliedFilters.type}|${appliedFilters.yearMin}|${appliedFilters.yearMax}`;
  }, [appliedFilters]);

  const fetchPage = useCallback(
    async (nextOffset: number, filters = appliedFilters) => {
      const key = `${nextOffset}|${filters.title}|${filters.type}|${filters.yearMin}|${filters.yearMax}`;
      if (inFlightRef.current || key === lastKeyRef.current) return;
      inFlightRef.current = true;
      lastKeyRef.current = key;

      setIsLoading(true);
      try {
        const params: any = { limit, offset: nextOffset };
        if (SERVER_FILTERS) {
          if (filters.title?.trim()) params.title = filters.title.trim();
          if (filters.type?.trim()) params.type = filters.type.trim();
          if (filters.yearMin) params.yearMin = Number(filters.yearMin);
          if (filters.yearMax) params.yearMax = Number(filters.yearMax);
        }
        const { data } = await api.get("/moviesapi/allmovies", { params });
        const list: Movie[] = data?.items ?? [];
        const count: number = data?.total ?? list.length;

        setItems((prev) => (nextOffset === 0 ? list : [...prev, ...list]));
        setTotal(count);
        setHasMore(list.length === limit && nextOffset + list.length < count);
        setOffset(nextOffset);
      } finally {
        inFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [limit, appliedFilters]
  );

  // Initial load and version/filter reset
  useEffect(() => {
    lastKeyRef.current = "";
    fetchPage(0);
  }, [fetchPage, version, filterKey]);

  // Server-side filter change
  useEffect(() => {
    if (SERVER_FILTERS) {
      lastKeyRef.current = "";
      fetchPage(0, appliedFilters);
    }
  }, [appliedFilters, fetchPage]);

  const onCreate = async (m: Movie) => {
    const { id, createdAt, updatedAt, userId, ...payload } = m as any;
    const { data } = await api.post("/moviesapi/addmovie", payload);
    setItems((p) => [data, ...p]);
    setTotal((t) => t + 1);
  };

  const onUpdate = async (m: Movie) => {
    if (!m?.id) return;
    const { id, userId, createdAt, updatedAt, ...payload } = m as any;
    const { data } = await api.put(`/moviesapi/updatemovie/${id}`, payload);
    setItems((p) => p.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    await api.delete(`/moviesapi/deletemovie/${id}`);
    setItems((p) => p.filter((x) => x.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    setConfirm({ open: false });
  };

  // Client-side filtering
  const rows = useMemo(() => {
    if (SERVER_FILTERS) return items;

    const f = appliedFilters;
    const titleQ = f.title.trim().toLowerCase();
    const typeQ = f.type.trim().toLowerCase();
    const yMin = f.yearMin ? parseInt(f.yearMin, 10) : undefined;
    const yMax = f.yearMax ? parseInt(f.yearMax, 10) : undefined;

    return items.filter((m) => {
      const okTitle = titleQ
        ? (m.title ?? "").toLowerCase().includes(titleQ)
        : true;
      const okType = typeQ ? (m.type ?? "").toLowerCase() === typeQ : true;

      const yRaw =
        typeof m.year === "number" ? m.year : parseInt(String(m.year), 10);
      const y = Number.isFinite(yRaw) ? (yRaw as number) : NaN;

      const okYearMin =
        yMin !== undefined ? !Number.isNaN(y) && y >= yMin : true;
      const okYearMax =
        yMax !== undefined ? !Number.isNaN(y) && y <= yMax : true;

      return okTitle && okType && okYearMin && okYearMax;
    });
  }, [items, appliedFilters]);

  // IntersectionObserver with strict cleanup
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isLoading || !hasMore) return;

    const container = node.closest(
      ".MuiTableContainer-root"
    ) as HTMLElement | null;

    let pending = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || pending || isLoading || !hasMore) return;
        pending = true;
        queueMicrotask(() => {
          fetchPage(offset + limit);
          pending = false;
        });
      },
      { root: container ?? undefined, threshold: 0.1, rootMargin: "0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [offset, limit, hasMore, isLoading, fetchPage]);

  const resetDraft = () =>
    setDraftFilters({ title: "", type: "", yearMin: "", yearMax: "" });

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFilterOpen(false);
    if (SERVER_FILTERS) {
      lastKeyRef.current = "";
      fetchPage(0, draftFilters);
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 24 / 8 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1.5, fontWeight: 700, letterSpacing: 0.2 }}
        >
          Add movie
        </Typography>
        <ManualMovieForm onSubmit={onCreate} submitLabel="Add movie" />
      </Paper>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Favourites ({items.length} of {total})
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {
            setDraftFilters(appliedFilters);
            setFilterOpen(true);
          }}
        >
          Filters
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          borderRadius: 2,
          border: (t) =>
            `1px solid ${t.palette.mode === "dark" ? "#1f1f1f" : "#e5e5e5"}`,
          bgcolor: (t) => (t.palette.mode === "dark" ? "#0f0f0f" : "#fff"),
          overflow: "auto",
          maxHeight: { xs: 480, sm: 560, md: 640 },
        }}
      >
        <Table
          stickyHeader
          size="small"
          aria-label="movies table"
          sx={{
            tableLayout: "fixed",
            "& thead th": {
              fontWeight: 700,
              letterSpacing: 0.2,
              bgcolor: (t) =>
                t.palette.mode === "dark" ? "#131313" : "#f5f5f5",
            },
            "& tbody tr:nth-of-type(odd)": {
              bgcolor: (t) =>
                t.palette.mode === "dark" ? "#0d0d0d" : "fafafa",
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
                sx={{
                  "& td": {
                    borderColor: (t) =>
                      t.palette.mode === "dark" ? "#1a1a1a" : "#eee",
                  },
                }}
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
                        objectFit: "cover",
                        borderRadius: 1,
                        display: "block",
                        border: (t) =>
                          `1px solid ${
                            t.palette.mode === "dark" ? "#1f1f1f" : "#e5e5e5"
                          }`,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 72,
                        bgcolor: (t) =>
                          t.palette.mode === "dark" ? "#161616" : "#f1f1f1",
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
                  {m.type && (
                    <Chip
                      label={m.type}
                      size="small"
                      sx={{ borderRadius: 1, fontWeight: 600 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={m.director}>
                    {m.director}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{m.year}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{m.duration}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{m.budget}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={m.location}>
                    {m.location}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={`Edit ${m.title}`}
                    onClick={() => setEditing(m)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Delete ${m.title}`}
                    onClick={() => setConfirm({ open: true, id: m.id })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box sx={{ py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {hasMore && (
              <TableRow ref={sentinelRef}>
                <TableCell colSpan={9} />
              </TableRow>
            )}

            {rows.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ py: 6, textAlign: "center" }}>
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

      {/* Filters dialog */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiPaper-root": { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.2, pb: 1 }}>
          Filters
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            {SERVER_FILTERS
              ? "Filters apply on the server."
              : "Filters apply instantly on the current page."}
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              label="Title contains"
              value={draftFilters.title}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, title: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Type (exact, e.g., movie/series)"
              value={draftFilters.type}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, type: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Year min"
                value={draftFilters.yearMin}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    yearMin: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                size="small"
                inputMode="numeric"
              />
              <TextField
                label="Year max"
                value={draftFilters.yearMax}
                onChange={(e) =>
                  setDraftFilters((f) => ({
                    ...f,
                    yearMax: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                size="small"
                inputMode="numeric"
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

      {/* Edit dialog with external submit button bound to inner form */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiPaper-root": { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.2, pb: 1 }}>
          Edit movie
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {editing && (
            <ManualMovieForm
              initial={editing}
              onSubmit={onUpdate}
              submitLabel="Update"
              onCancel={() => setEditing(null)}
              formId="edit-movie-form"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button type="submit" form="edit-movie-form" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false })}
        sx={{ "& .MuiPaper-root": { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 0.2, pb: 1 }}>
          Delete this movie?
        </DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirm({ open: false })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => onDelete(confirm.id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
