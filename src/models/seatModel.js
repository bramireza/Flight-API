import { pool } from "../config/database.js";

export const getSeatsByAirplaneId = async (airplaneId) => {
  try {
    const query = `
      SELECT * FROM seat
      WHERE airplane_id = ?
      `;
    const [rows] = await pool.query(query, [airplaneId]);
    return rows;
  } catch (error) {
    throw error;
  }
};
