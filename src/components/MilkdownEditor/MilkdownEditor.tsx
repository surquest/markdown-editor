'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Switch, FormControlLabel, Paper } from '@mui/material';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import CloseIcon from '@mui/icons-material/Close';

import { MilkdownProvider, useMilkdownContext } from './MilkdownProvider';
import { MilkdownEditorUI } from './MilkdownEditorUI';
import { IframeDialog } from './plugins/iframe';
import { CarouselDialog } from './plugins/carousel';
import { AccordionDialog } from './plugins/accordion';
import { CardsDialog } from './plugins/cards';

import MarkdownSourceRenderer from './MarkdownSourceRenderer';
import { HtmlSourceRenderer } from './HtmlRenderer';

import { carouselPlugin } from './plugins/carousel/carouselPlugin';
import { iframePlugin } from './plugins/iframe/iframePlugin';
import { accordionPlugin } from './plugins/accordion/accordionPlugin';
import { cardsPlugin } from './plugins/cards/cardsPlugin';
import { MinimalEditorProps } from './types';

// Standalone components re-exported for flexible usage
export { MilkdownProvider, MilkdownEditorUI, IframeDialog, CarouselDialog, AccordionDialog, CardsDialog };

function SplitViewer() {
  const { liveMarkdown, setMarkdownContent } = useMilkdownContext();
  const [showSourcePane, setShowSourcePane] = useState(true);
  const [viewMode, setViewMode] = useState<'markdown' | 'html'>('html');

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Left Pane - Editor */}
      <Box 
        sx={{ 
          position: 'relative',
          resize: showSourcePane ? 'horizontal' : 'none', 
          overflow: 'auto', 
          minWidth: '300px', 
          width: showSourcePane ? '50%' : '100%', 
          minHeight: '90vh',
          maxWidth: showSourcePane ? '100%' : '100%',
          flexShrink: 0,
          pr: showSourcePane ? 2 : 0,
          pb: 1, // room for the resize handle
        }}
      >
        <MilkdownEditorUI />
        
        {!showSourcePane && (
          <Tooltip title="Show Source / Preview">
            <IconButton 
              onClick={() => setShowSourcePane(true)} 
              sx={{ position: 'absolute', top: 32, right: 32, zIndex: 10, bgcolor: 'background.paper', boxShadow: 1 }}
            >
              <VerticalSplitIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Right Pane - Source / Preview */}
      {showSourcePane && (
        <Box 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            pl: 1, 
            overflow: 'hidden', 
            minWidth: '300px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={viewMode === 'html'} 
                  onChange={(e) => setViewMode(e.target.checked ? 'html' : 'markdown')} 
                />
              }
              label={viewMode === 'html' ? 'HTML Rendered' : 'Raw Markdown Editor'}
            />
            <IconButton onClick={() => setShowSourcePane(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Paper sx={{ flexGrow: 1, p: 0, bgcolor: 'grey.50', display: 'flex', overflow: 'hidden' }} variant="outlined">
            {viewMode === 'markdown' ? (
              <MarkdownSourceRenderer markdown={liveMarkdown} onChange={setMarkdownContent} />
            ) : (
              <Box sx={{ p: 2, overflow: 'auto', width: '100%' }}>
                <HtmlSourceRenderer markdown={liveMarkdown} />
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default function MilkdownEditor({ content }: MinimalEditorProps) {
  return (
    <MilkdownProvider 
      content={content} 
      plugins={[carouselPlugin, iframePlugin, accordionPlugin, cardsPlugin]}
    >
      <SplitViewer />
      <IframeDialog />
      <CarouselDialog />
      <AccordionDialog />
      <CardsDialog />
    </MilkdownProvider>
  );
}

