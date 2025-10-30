import { IconButton, InputAdornment, TextField } from '@mui/material';
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
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
      size="small"
      variant="outlined"
      InputProps={{
        sx: {
          borderRadius: 999,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#121212' : '#fff'),
        },
        endAdornment: (
          <InputAdornment position="end" sx={{ pr: 0.5 }}>
            {q && (
              <IconButton aria-label="Clear search" size="small" onClick={clear} disabled={isLoading} sx={{ mr: 0.25 }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              aria-label="Search"
              size="small"
              onClick={submit}
              disabled={isLoading || !q.trim()}
              sx={{ ml: 0.5, opacity: isLoading || !q.trim() ? 0.6 : 1 }}
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
