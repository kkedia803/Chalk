import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(255) PRIMARY KEY,
      language VARCHAR(50) NOT NULL,
      code TEXT NOT NULL,
      status VARCHAR(50) NOT NULL,
      output TEXT,
      error TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await query(createTableQuery);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database", err);
  }
};
