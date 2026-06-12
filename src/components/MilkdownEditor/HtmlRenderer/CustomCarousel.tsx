'use client';

import React, { useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomCarousel = ({ children }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = containerRef.current;
      if (scrollLeft <= 10) {
        containerRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        containerRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = containerRef.current;
      if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        containerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', my: 2, borderRadius: 1, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Box 
        ref={containerRef}
        sx={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: 0, 
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '& ul': { display: 'flex', m: 0, p: 0, listStyle: 'none', width: '100%' }, 
          '& li': { flex: '0 0 100%', minWidth: '100%', scrollSnapAlign: 'start', '& img': { width: '100%', height: '100%', aspectRatio: '16/9', objectFit: 'cover' }, bgcolor: 'action.hover' }, 
          '& p': { m: 0, display: 'flex', width: '100%', height: '100%' } 
        }}
      >
        {children}
      </Box>

      <IconButton 
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(250, 250, 250, 0.75)',
          color: 'rgba(0, 0, 0, 0.54)',
          boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
          '&:hover': { bgcolor: '#fff', color: 'rgba(0,0,0,0.8)' }
        }}
        aria-label="Previous image"
      >
        <ArrowBackIcon />
      </IconButton>

      <IconButton 
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 16,
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(250, 250, 250, 0.75)',
          color: 'rgba(0, 0, 0, 0.54)',
          boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
          '&:hover': { bgcolor: '#fff', color: 'rgba(0,0,0,0.8)' }
        }}
        aria-label="Next image"
      >
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  );
};
