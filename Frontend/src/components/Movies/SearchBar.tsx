import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

type Props = { onSearch: (title: string) => void };

export default function SearchBar({ onSearch }: Props) {
  const [q, setQ] = useState('');
  return (
    <TextField
      fullWidth
      placeholder="Search movie by title..."
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(q)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => onSearch(q)}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
