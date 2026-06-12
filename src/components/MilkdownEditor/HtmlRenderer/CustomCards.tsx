import React from 'react';
import { Box } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomCards = ({ columns, children }: any) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns || 3}, 1fr)`, gap: 2, my: 2 }}>
      {children}
    </Box>
  );
};
