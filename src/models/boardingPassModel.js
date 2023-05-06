import { pool } from "../config/database.js";

export const getBoardingPassByFlightId = async (flightId) => {
  try {
    const query = `
      SELECT * FROM 
      boarding_pass AS bp
      INNER JOIN passenger AS p ON bp.passenger_id = p.passenger_id
      WHERE bp.flight_id = ?
    `;
    const [rows] = await pool.query(query, [flightId]);
    return rows;
  } catch (err) {
    throw err;
  }
};
