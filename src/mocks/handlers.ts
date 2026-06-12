import { http, HttpResponse } from 'msw';
import { saveImage, getImage, getAllImages } from '../lib/db';

export const handlers = [
  http.get('/images', async () => {
    try {
      const images = await getAllImages();
      return HttpResponse.json(images);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
  }),

  http.get('/images/:imageId', async ({ params, request }) => {
    try {
      const imageId = params.imageId as string;
      const image = await getImage(imageId);
      if (!image) {
        return HttpResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      // If the request accepts json, return the JSON. Otherwise, return the image blob.
      if (request.headers.get('Accept')?.includes('application/json')) {
        return HttpResponse.json(image);
      }

      const byteString = atob(image.dataUrl.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      return new HttpResponse(arrayBuffer, {
        headers: {
          'Content-Type': image.type,
          'Content-Length': image.size.toString(),
        },
      });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 });
    }
  }),

  http.post('/images', async ({ request }) => {
    try {
      const newImage = await request.json() as any;
      if (!newImage.id || !newImage.dataUrl) {
        return HttpResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
      const saved = await saveImage(newImage);
      return HttpResponse.json(saved, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to save image' }, { status: 500 });
    }
  }),
];