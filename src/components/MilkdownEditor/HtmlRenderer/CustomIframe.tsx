import React from 'react';
import { Box } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomIframe = ({ src }: any) => {
  return (
    <Box sx={{ my: 2, width: '100%', height: 400, overflow: 'hidden', borderRadius: 1, border: 1, borderColor: 'divider' }}>
      <iframe src={src} style={{ width: '100%', height: '100%', border: 'none' }} title="Embedded iframe" />
    </Box>
  );
};
