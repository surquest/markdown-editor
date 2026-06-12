import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { editorViewCtx } from '@milkdown/kit/core';
import { insert } from '@milkdown/utils';

export default function IframeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('https://');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingActionRef = useRef<{ type: 'insert', ctx: any } | { type: 'edit', ctx: any, pos: number } | null>(null);

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const { src, pos, ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'edit', ctx, pos };
      setUrl(src || 'https://');
      setIsOpen(true);
    };

    const handleInsert = (e: Event) => {
      const { ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'insert', ctx };
      setUrl('https://');
      setIsOpen(true);
    };

    document.addEventListener('milkdown-iframe-edit', handleEdit);
    document.addEventListener('milkdown-iframe-insert', handleInsert);
    return () => {
      document.removeEventListener('milkdown-iframe-edit', handleEdit);
      document.removeEventListener('milkdown-iframe-insert', handleInsert);
    };
  }, []);

  const handleSubmit = () => {
    if (!pendingActionRef.current || !url) {
      setIsOpen(false);
      return;
    }

    const action = pendingActionRef.current;
    const actionCtx = action.ctx;
    const view = actionCtx.get(editorViewCtx);
    const { state } = view;
    const { tr } = state;

    if (action.type === 'insert') {
      const { selection } = state;
      view.dispatch(tr.delete(selection.$from.start(), selection.$from.end()));
      insert(`::iframe{src="${url}"}`)(actionCtx);
    } else if (action.type === 'edit') {
      let actualPos = action.pos;
      const node = state.doc.nodeAt(actualPos);
      if (!node || node.type.name !== 'iframe') {
        const nodeBefore = state.doc.nodeAt(actualPos - 1);
        if (nodeBefore && nodeBefore.type.name === 'iframe') {
          actualPos = actualPos - 1;
        }
      }
      view.dispatch(tr.setNodeMarkup(actualPos, null, { src: url }));
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
      <DialogTitle>Insert Iframe</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Iframe URL"
          type="url"
          fullWidth
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Insert</Button>
      </DialogActions>
    </Dialog>
  );
}
