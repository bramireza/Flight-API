import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
// Configuration of the connection pool to the database
export const pool = await mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
