import * as flightModel from "../models/flightModel.js";
import * as boardingPassModel from "../models/boardingPassModel.js";
import * as seatModel from "../models/seatModel.js";

export const getFlightCheckin = async (req, res) => {
  try {
    const flightId = parseInt(req.params.id);

    const flight = await flightModel.getFlightById(flightId);
    const boardingPass = await boardingPassModel.getBoardingPassByFlightId(
      flightId
    );
    const allSeats = await seatModel.getSeatsByAirplaneId(flight.airplane_id);
    res.status(200).json({
      code: 200,
      data: {
        ...flight,
        boardingPass,
        allSeats,
      },
    });
  } catch (error) {
    throw error;
  }
};
