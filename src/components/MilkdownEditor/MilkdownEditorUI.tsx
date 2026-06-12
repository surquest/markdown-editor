'use client';

import { Box } from '@mui/material';
import { useMilkdownContext } from './MilkdownProvider';

export function MilkdownEditorUI() {
  const { containerRef } = useMilkdownContext();

  return (
    <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        border: '1px solid #ddd', 
        borderRadius: 2, 
        p: 2,
        '& .ProseMirror': {
          fontFamily: 'var(--font-montserrat), sans-serif',
        }
    }}>
      <div ref={containerRef} />
    </Box>
  );
}