import { Box, Container, Paper, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  return (
    <Container maxWidth="md" className="py-10">
      <Paper className="p-4">
        <Tabs value={tab} onChange={(_, v)=>setTab(v)} centered>
          <Tab label="Login" />
          <Tab label="Sign up" />
        </Tabs>
        <Box className="mt-6">{tab === 0 ? <Login /> : <Signup />}</Box>
      </Paper>
    </Container>
  );
}
