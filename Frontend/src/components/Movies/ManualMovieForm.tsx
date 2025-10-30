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
  Stack,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../../types";

type Props = {
  initial?: Movie | null;
  onSubmit: (m: Movie) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  formId?: string;
};

export default function ManualMovieForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Add movie",
  formId,
}: Props) {
  const [form, setForm] = useState<Movie>({
    id: undefined as any, // ensure id exists when editing
    title: "",
    type: "Movie",
    director: "",
    budget: "",
    location: "",
    duration: "",
    year: "",
    poster: "",
  });
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setExpanded(true);
    }
  }, [initial]);

  const title = useMemo(
    () => (submitLabel === "Update" ? "Edit movie" : "Manual entry"),
    [submitLabel]
  );
  const update = (k: keyof Movie, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    // Keep id if present; remove server-managed fields
    const { userId, createdAt, updatedAt, ...payload } = form as any;
    await onSubmit(payload as Movie);
    if (!initial) {
      setForm({
        id: undefined as any,
        title: "",
        type: "Movie",
        director: "",
        budget: "",
        location: "",
        duration: "",
        year: "",
        poster: "",
      });
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
        overflow: "hidden",
        border: (t) =>
          `1px solid ${t.palette.mode === "dark" ? "#1f1f1f" : "#e5e5e5"}`,
        bgcolor: (t) => (t.palette.mode === "dark" ? "#111" : "fafafa"),
        "&:before": { display: "none" },
      }}
    >
      {/* Keep IconButton OUTSIDE AccordionSummary to avoid nested buttons */}
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          sx={{
            px: 0,
            py: 0,
            minHeight: 48,
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
              gap: 1.5,
              my: 0.5,
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: 0.2 }}
          >
            {title}
          </Typography>
          {!expanded && (
            <Typography variant="body2" color="text.secondary">
              Quick add a title, type, and more
            </Typography>
          )}
        </AccordionSummary>

        {onCancel && (
          <IconButton
            aria-label="Close"
            edge="end"
            onClick={() => {
              onCancel?.();
              setExpanded(false);
            }}
            sx={{ ml: "auto" }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <AccordionDetails sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box component="form" id={formId} onSubmit={handle}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ToggleButtonGroup
                exclusive
                value={form.type}
                onChange={(_, v) => v && update("type", v)}
                fullWidth
                size="small"
                sx={{
                  borderRadius: 1,
                  "& .MuiToggleButton-root": {
                    flex: 1,
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                <ToggleButton value="Movie">Movie</ToggleButton>
                <ToggleButton value="TV Show">TV Show</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Director"
                fullWidth
                value={form.director}
                onChange={(e) => update("director", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Budget"
                fullWidth
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location"
                fullWidth
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Duration"
                fullWidth
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Year"
                fullWidth
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Poster URL"
                fullWidth
                value={form.poster}
                onChange={(e) => update("poster", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Local buttons only if no external Dialog submit */}
          {!formId && (
            <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                {submitLabel}
              </Button>
              {onCancel && (
                <Button
                  onClick={() => {
                    onCancel();
                    setExpanded(false);
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
