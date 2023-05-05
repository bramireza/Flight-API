import { pool } from "../config/database.js";

export const getFligth = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM flight");
    return rows;
  } catch (error) {
    throw error;
  }
};
