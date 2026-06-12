'use client';

import { Container, Typography, AppBar, Toolbar, Box, CircularProgress } from '@mui/material';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EditorWrapper from '@/components/EditorWrapper';

function EditorLoader() {
  const [defaultContent, setDefaultContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const docFilename = searchParams.get('document') || 'default.md';

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetch(`/documents/${docFilename}`)
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.text();
        })
        .then((text) => {
          setDefaultContent(text);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch document:', err);
          setLoading(false);
        });
    }, 1500);
  }, [docFilename]);

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      <Container 
        sx={{ 
          mt: 4, 
          minWidth: '90vw',
          minHeight: '90vh', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: loading ? 'center' : 'stretch'
        }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <EditorWrapper content={defaultContent} />
        )}
      </Container>
    </Box>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    }>
      <EditorLoader />
    </Suspense>
  );
}

