import React, { useState, useEffect, DragEvent, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, FormControlLabel, IconButton, Box, Typography, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { editorViewCtx } from '@milkdown/kit/core';
import { insert } from '@milkdown/utils';

export default function CarouselDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [autorotate, setAutorotate] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingActionRef = useRef<{ type: 'insert', ctx: any } | { type: 'edit', ctx: any, pos: number } | null>(null);

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const { images, autorotate, speed, pos, ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'edit', ctx, pos };
      try {
        setImages(JSON.parse(decodeURIComponent(images)));
      } catch {
        setImages([]);
      }
      setAutorotate(autorotate === true || autorotate === 'true');
      setSpeed(Number(speed) || 3);
      setIsOpen(true);
    };

    const handleInsert = (e: Event) => {
      const { ctx } = (e as CustomEvent).detail;
      pendingActionRef.current = { type: 'insert', ctx };
      setImages([]);
      setAutorotate(false);
      setSpeed(3);
      setIsOpen(true);
    };

    document.addEventListener('milkdown-carousel-edit', handleEdit);
    document.addEventListener('milkdown-carousel-insert', handleInsert);
    return () => {
      document.removeEventListener('milkdown-carousel-edit', handleEdit);
      document.removeEventListener('milkdown-carousel-insert', handleInsert);
    };
  }, []);

  const handleAddImage = () => setImages([...images, '']);
  
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

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

    const encodedImages = encodeURIComponent(JSON.stringify(images.filter(url => url.trim() !== '')));
    const autorotateStr = String(autorotate);
    const speedStr = String(speed);

    if (action.type === 'insert') {
      const { selection } = state;
      view.dispatch(tr.delete(selection.$from.start(), selection.$from.end()));
      
      let markdownStr = `:::carousel{autorotate="${autorotateStr}" speed="${speedStr}"}\n`;
      images.filter(url => url.trim() !== '').forEach(url => {
        markdownStr += `- ${url}\n`;
      });
      markdownStr += `:::\n`;
      
      insert(markdownStr)(actionCtx);
    } else if (action.type === 'edit') {
      let actualPos = action.pos;
      const node = state.doc.nodeAt(actualPos);
      if (!node || node.type.name !== 'carousel') {
        const nodeBefore = state.doc.nodeAt(actualPos - 1);
        if (nodeBefore && nodeBefore.type.name === 'carousel') {
          actualPos = actualPos - 1;
        }
      }
      view.dispatch(tr.setNodeMarkup(actualPos, null, { 
        images: encodedImages, 
        autorotate: autorotateStr, 
        speed: speedStr 
      }));
    }

    setIsOpen(false);
    pendingActionRef.current = null;
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    const newUrls: string[] = [];
    
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      
      try {
        const dataUrl = await toBase64(file);
        const id = crypto.randomUUID();
        const payload = {
          id,
          name: file.name,
          dataUrl,
          type: file.type,
          size: file.size
        };

        const response = await fetch('/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          newUrls.push(`/images/${id}`);
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }
    
    if (newUrls.length > 0) {
      setImages(prev => [...prev.filter(url => url.trim() !== ''), ...newUrls]);
    }
    setIsUploading(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Carousel</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControlLabel
            control={<Switch checked={autorotate} onChange={(e) => setAutorotate(e.target.checked)} />}
            label="Enable Autorotation"
          />
          
          <TextField
            label="Rotation Speed (seconds)"
            type="number"
            fullWidth
            size="small"
            variant="outlined"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={!autorotate}
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Images</Typography>
          
          <Box 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragging ? 'action.hover' : 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: '#1976d2'
              }
            }}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={onFileInputChange}
            />
            {isUploading ? (
              <CircularProgress size={32} />
            ) : (
              <>
                <UploadFileIcon fontSize="large" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Drag and drop images here, or click to select files
                </Typography>
              </>
            )}
          </Box>

          {images.map((url, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField 
                fullWidth 
                size="small"
                placeholder="https://example.com/image.png"
                value={url} 
                onChange={(e) => handleImageChange(index, e.target.value)} 
              />
              <IconButton onClick={() => handleRemoveImage(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddImage}>
            Add Image
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}