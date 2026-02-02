import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: '"Noto Naskh Arabic", serif', fontWeight: 700 }}>
        Shop Dashboard
      </Typography>
      <Typography color="text.secondary">
        This page is under development...
      </Typography>
    </Box>
  );
};

export default Dashboard;
