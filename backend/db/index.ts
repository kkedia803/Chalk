import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export const testDB = async () =>{
  const res = await db.execute("SELECT 1");
  console.log("DB connected:",res.rows)
}

export const db = drizzle(pool,{schema});

