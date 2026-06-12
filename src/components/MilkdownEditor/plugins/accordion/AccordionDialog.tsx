import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { editorViewCtx } from '@milkdown/kit/core';
import { insert } from '@milkdown/utils';

export default function AccordionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📌');
  const [description, setDescription] = useState('');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingActionRef = useRef<{ type: 'insert', ctx: any } | { type: 'edit', ctx: any, pos: number } | null>(null);

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const { title, icon, description, pos, ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'edit', ctx, pos };
      setTitle(title || '');
      setIcon(icon || '');
      setDescription(description || '');
      setIsOpen(true);
    };

    const handleInsert = (e: Event) => {
      const { ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'insert', ctx };
      setTitle('');
      setIcon('📌');
      setDescription('');
      setIsOpen(true);
    };

    document.addEventListener('milkdown-accordion-edit', handleEdit);
    document.addEventListener('milkdown-accordion-insert', handleInsert);
    return () => {
      document.removeEventListener('milkdown-accordion-edit', handleEdit);
      document.removeEventListener('milkdown-accordion-insert', handleInsert);
    };
  }, []);

  const handleSubmit = () => {
    if (!pendingActionRef.current) {
      setIsOpen(false);
      return;
    }

    const action = pendingActionRef.current;
    const actionCtx = action.ctx;
    const view = actionCtx.get(editorViewCtx);
    const { state } = view;
    const { tr } = state;

    // Properly escape quotes for the directive
    const safeTitle = title.replace(/"/g, '&quot;');
    const safeIcon = icon.replace(/"/g, '&quot;');
    const safeDescription = description.replace(/"/g, '&quot;');

    if (action.type === 'insert') {
      const { selection } = state;
      view.dispatch(tr.delete(selection.$from.start(), selection.$from.end()));
      insert(`::accordion{title="${safeTitle}" icon="${safeIcon}" description="${safeDescription}"}`)(actionCtx);
    } else if (action.type === 'edit') {
      let actualPos = action.pos;
      const node = state.doc.nodeAt(actualPos);
      if (!node || node.type.name !== 'accordion') {
        const nodeBefore = state.doc.nodeAt(actualPos - 1);
        if (nodeBefore && nodeBefore.type.name === 'accordion') {
          actualPos = actualPos - 1;
        }
      }
      view.dispatch(tr.setNodeMarkup(actualPos, null, { title, icon, description }));
    }

    setIsOpen(false);
    pendingActionRef.current = null;
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog 
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{pendingActionRef.current?.type === 'edit' ? 'Edit Accordion' : 'Insert Accordion'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Icon (Emoji or URL)"
          type="text"
          fullWidth
          variant="outlined"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{pendingActionRef.current?.type === 'edit' ? 'Save' : 'Insert'}</Button>
      </DialogActions>
    </Dialog>
  );
}