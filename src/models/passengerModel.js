import { pool } from "../config/database.js";

export const getPassengerById = async (passengerId) => {
  try {
    const query = `
      SELECT *
      FROM passenger
      WHERE passenger_id = ?
    `;
    const [rows] = await pool.query(query, [passengerId]);
    return rows;
  } catch (err) {
    throw err;
  }
};
