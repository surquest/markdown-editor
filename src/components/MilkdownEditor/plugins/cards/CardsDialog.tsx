import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Select, MenuItem, InputLabel, FormControl, Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { editorViewCtx } from '@milkdown/kit/core';
import { insert } from '@milkdown/utils';

export default function CardsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [columns, setColumns] = useState('3');
  const [target, setTarget] = useState('_blank');
  const [cards, setCards] = useState([{ title: '', image: '', description: '', link: '' }]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingActionRef = useRef<any>(null);

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const { columns, target, data, pos, ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'edit', ctx, pos };
      setColumns(columns || '3');
      setTarget(target || '_blank');
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(parsed);
        } else {
          setCards([{ title: '', image: '', description: '', link: '' }]);
        }
      } catch {
        setCards([{ title: '', image: '', description: '', link: '' }]);
      }
      setIsOpen(true);
    };

    const handleInsert = (e: Event) => {
      const { ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'insert', ctx };
      setColumns('3');
      setTarget('_blank');
      setCards([{ title: '', image: '', description: '', link: '' }]);
      setIsOpen(true);
    };

    document.addEventListener('milkdown-cards-edit', handleEdit);
    document.addEventListener('milkdown-cards-insert', handleInsert);
    return () => {
      document.removeEventListener('milkdown-cards-edit', handleEdit);
      document.removeEventListener('milkdown-cards-insert', handleInsert);
    };
  }, []);

  const handleSubmit = () => {
    if (!pendingActionRef.current) return;

    const action = pendingActionRef.current;
    const actionCtx = action.ctx;
    const view = actionCtx.get(editorViewCtx);
    const { state } = view;
    const { tr } = state;
    
    // Properly clean content inside object stringification to prevent HTML injection breaks
    const cleanCards = cards.map(c => ({
      title: c.title.replace(/"/g, '&quot;'),
      image: c.image.replace(/"/g, '&quot;'),
      description: c.description.replace(/"/g, '&quot;'),
      link: c.link.replace(/"/g, '&quot;')
    }));

    const encodedData = encodeURIComponent(JSON.stringify(cleanCards));

    if (action.type === 'insert') {
      const { selection } = state;
      view.dispatch(tr.delete(selection.$from.start(), selection.$from.end()));
      
      const cardsMarkdown = cleanCards.map(c => `  ::card{title="${c.title}" image="${c.image}" description="${c.description}" link="${c.link}"}`).join('\n\n');
      const markdownToInsert = `:::cards{columns="${columns}" target="${target}"}\n\n${cardsMarkdown}\n\n:::`;
      
      insert(markdownToInsert)(actionCtx);
    } else if (action.type === 'edit') {
      let actualPos = action.pos;
      const node = state.doc.nodeAt(actualPos);
      if (!node || node.type.name !== 'cards') {
        const nodeBefore = state.doc.nodeAt(actualPos - 1);
        if (nodeBefore && nodeBefore.type.name === 'cards') {
          actualPos = actualPos - 1;
        }
      }
      view.dispatch(tr.setNodeMarkup(actualPos, null, { columns, target, data: encodedData }));
    }

    setIsOpen(false);
    pendingActionRef.current = null;
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{pendingActionRef.current?.type === 'edit' ? 'Edit Cards Collection' : 'Insert Cards Collection'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Columns per row</InputLabel>
            <Select value={columns} label="Columns per row" onChange={(e) => setColumns(e.target.value)}>
              <MenuItem value="1">1 Column</MenuItem>
              <MenuItem value="2">2 Columns</MenuItem>
              <MenuItem value="3">3 Columns</MenuItem>
              <MenuItem value="4">4 Columns</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Link Target</InputLabel>
            <Select value={target} label="Link Target" onChange={(e) => setTarget(e.target.value)}>
              <MenuItem value="_blank">New Tab (_blank)</MenuItem>
              <MenuItem value="_self">Current Tab (_self)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {cards.map((card, i) => (
          <Box key={i} sx={{ border: '1px solid #e0e0e0', p: 3, pt: 4, borderRadius: 2, mb: 3, position: 'relative', background: '#fafafa' }}>
            <IconButton 
              size="small" 
              color="error" 
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => setCards(cards.filter((_, idx) => idx !== i))}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ position: 'absolute', top: -10, left: 16, background: '#fafafa', px: 1, color: 'primary.main', fontWeight: 700 }}>
              Card {i + 1}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth size="small" label="Title" value={card.title} onChange={(e) => updateCard(i, 'title', e.target.value)} />
              <TextField fullWidth size="small" label="Image URL (Thumbnail)" value={card.image} onChange={(e) => updateCard(i, 'image', e.target.value)} />
              <TextField fullWidth size="small" label="Link URL" value={card.link} onChange={(e) => updateCard(i, 'link', e.target.value)} />
              <TextField fullWidth size="small" label="Description (Optional)" multiline rows={2} value={card.description} onChange={(e) => updateCard(i, 'description', e.target.value)} />
            </Box>
          </Box>
        ))}

        <Button startIcon={<AddIcon />} onClick={() => setCards([...cards, { title: '', image: '', description: '', link: '' }])} variant="outlined" fullWidth sx={{ borderStyle: 'dashed' }}>
          Add Card
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disableElevation>{pendingActionRef.current?.type === 'edit' ? 'Save Changes' : 'Insert Collection'}</Button>
      </DialogActions>
    </Dialog>
  );
}