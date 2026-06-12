import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ImageDB extends DBSchema {
  images: {
    key: string;
    value: {
      id: string;
      name: string;
      dataUrl: string;
      type: string;
      size: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ImageDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('IndexedDB is not available on the server'));
  
  if (!dbPromise) {
    dbPromise = openDB<ImageDB>('markdown-editor-db', 1, {
      upgrade(db) {
        db.createObjectStore('images', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const saveImage = async (image: { id: string; name: string; dataUrl: string; type: string; size: number }) => {
  const db = await getDB();
  await db.put('images', image);
  return image;
};

export const getImage = async (id: string) => {
  const db = await getDB();
  return db.get('images', id);
};

export const getAllImages = async () => {
  const db = await getDB();
  return db.getAll('images');
};
