import { pool } from "../config/database.js";

export const getFlightById = async (flightId) => {
  try {
    const query = `
      SELECT * FROM flight
      WHERE flight_id = ?
      `;
    const [rows] = await pool.query(query, flightId);
    return rows[0];
  } catch (error) {
    throw error;
  }
};
