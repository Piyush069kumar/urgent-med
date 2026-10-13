import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Ensure env vars are loaded before pool creation (this module runs at import time)
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Create a pool to the PostgreSQL database
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "Attendence",
  ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false }
});


pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});
