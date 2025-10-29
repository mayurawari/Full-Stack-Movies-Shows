import {
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useRef, useState } from 'react';

type Props = { onSearch: (title: string) => Promise<void> | void };

export default function SearchBar({ onSearch }: Props) {
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    const term = q.trim();
    if (!term || isLoading) return;
    try {
      setIsLoading(true);
      await onSearch(term);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setQ('');
    inputRef.current?.focus();
  };

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      placeholder="Search movie by title..."
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      }}
      size="small"
      variant="outlined"
      InputProps={{
        sx: {
          borderRadius: 999,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#121212' : '#fff'),
          border: (t) => `1px solid ${t.palette.mode === 'dark' ? '#1f1f1f' : '#e0e0e0'}`,
          '&.Mui-focused': {
            boxShadow: (t) =>
              `0 0 0 3px ${t.palette.mode === 'dark' ? 'rgba(234,234,234,0.15)' : 'rgba(17,17,17,0.15)'}`,
            borderColor: (t) => (t.palette.mode === 'dark' ? '#2a2a2a' : '#cfcfcf'),
          },
          '& input': { px: 1.25 },
        },
        endAdornment: (
          <InputAdornment position="end" sx={{ pr: 0.5 }}>
            {q && (
              <IconButton
                aria-label="Clear search"
                size="small"
                onClick={clear}
                disabled={isLoading}
                sx={{
                  mr: 0.25,
                  color: (t) => (t.palette.mode === 'dark' ? '#9a9a9a' : '#666'),
                  '&:hover': { color: (t) => (t.palette.mode === 'dark' ? '#cfcfcf' : '#111') },
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              aria-label="Search"
              size="small"
              onClick={submit}
              disabled={isLoading || !q.trim()}
              sx={{
                color: (t) => (t.palette.mode === 'dark' ? '#111' : '#fff'),
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#eaeaea' : '#111'),
                '&:hover': {
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#d5d5d5' : '#000'),
                },
                ml: 0.5,
                opacity: isLoading || !q.trim() ? 0.6 : 1,
                pointerEvents: isLoading || !q.trim() ? 'none' : 'auto',
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      inputProps={{ 'aria-label': 'Search movies' }}
    />
  );
}
