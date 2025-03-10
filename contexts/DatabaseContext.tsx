import React, { createContext, useContext, useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { initDatabase } from '../database/db';
import { MarkerData, ImageData } from '../types';

interface DatabaseContextType {
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<MarkerData[]>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<ImageData[]>;
  markers: MarkerData[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({} as DatabaseContextType);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
  
        // Переносим загрузку маркеров внутрь проверки на существование db
        if (database) {
          try {
            const initialMarkers = await getMarkers();
            setMarkers(initialMarkers);
          } catch (err) {
            // console.error('Ошибка при загрузке маркеров:', err);
          }
        }
      } catch (err) {
        setError(err as Error);
        console.error('Ошибка инициализации БД:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeDB();
  }, []);

  // Методы для работы с маркерами
  const addMarker = async (latitude: number, longitude: number): Promise<number> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      const result = await db.runAsync(
        'INSERT INTO markers (latitude, longitude) VALUES (?, ?)',
        [latitude, longitude]
      );
      return result.lastInsertRowId as number;
    } catch (err) {
      throw new Error('Ошибка при добавлении маркера');
    }
  };

  const getMarkers = async (): Promise<MarkerData[]> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      return await db.getAllAsync<MarkerData>('SELECT * FROM markers');
    } catch (err) {
      throw new Error('Ошибка при получении маркеров');
    }
  };

  const deleteMarker = async (id: number): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      await db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
    } catch (err) {
      throw new Error('Ошибка при удалении маркера');
    }
  };

  // Методы для работы с изображениями
  const addImage = async (markerId: number, uri: string): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      await db.runAsync(
        'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)',
        [markerId, uri]
      );
    } catch (err) {
      throw new Error('Ошибка при добавлении изображения');
    }
  };

  const getMarkerImages = async (markerId: number): Promise<ImageData[]> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      return await db.getAllAsync<ImageData>(
        'SELECT * FROM marker_images WHERE marker_id = ?',
        [markerId]
      );
    } catch (err) {
      throw new Error('Ошибка при получении изображений');
    }
  };

  const deleteImage = async (id: number): Promise<void> => {
    if (!db) throw new Error('База данных не инициализирована');
    
    try {
      await db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
    } catch (err) {
      throw new Error('Ошибка при удалении изображения');
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        markers,
        setMarkers,
        addMarker,
        deleteMarker,
        getMarkers,
        addImage,
        deleteImage,
        getMarkerImages,
        isLoading,
        error,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase должен использоваться внутри DatabaseProvider');
  }
  return context;
};