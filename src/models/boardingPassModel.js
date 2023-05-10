import { pool } from "../config/database.js";

export const getBoardingPassByFlightId = async (flightId) => {
  try {
    const query = `
      SELECT * FROM 
      passenger AS p
      INNER JOIN boarding_pass AS bp ON bp.passenger_id = p.passenger_id
      WHERE bp.flight_id = ?
    `;
    const [rows] = await pool.query(query, [flightId]);
    return rows;
  } catch (err) {
    throw err;
  }
};

export const getBoardingPassBySeatId = async (seatId) => {
  try {
    const query = `
      SELECT * FROM 
      boarding_pass 
      WHERE seat_id = ?
    `;
    const [rows] = await pool.query(query, [seatId]);
    return rows;
  } catch (err) {
    throw err;
  }
};
