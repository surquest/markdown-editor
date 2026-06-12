import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomCard = ({ title, image, description, link }: any) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component="a" href={link || '#'} target="_blank" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
        {image && <CardMedia component="img" sx={{ aspectRatio: '16/9' }} image={image} alt={title || 'Card object'} />}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
