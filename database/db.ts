import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('markers.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers(id) ON DELETE CASCADE
      );
    `);

    return db;
  } catch (error) {
    throw new Error(`Ошибка инициализации БД: ${error}`);
  }
};