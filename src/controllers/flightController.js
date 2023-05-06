import * as flightModel from "../models/flightModel.js";
import * as boardingPassModel from "../models/boardingPassModel.js";

export const getFlightCheckin = async (req, res) => {
  try {
    const flightId = parseInt(req.params.id);

    const flight = await flightModel.getFlightById(flightId);
    const boardingPass = await boardingPassModel.getBoardingPassByFlightId(
      flightId
    );
    const groupedBoardingPass = boardingPass.reduce((acc, bp) => {
      if (!acc[bp.purchase_id]) acc[bp.purchase_id] = [];
      acc[bp.purchase_id].push(bp);
      return acc;
    }, {});

    const assignedSeats = {};

    for (const purchaseId in groupedBoardingPass) {
      const boardingPassesGroup = groupedBoardingPass[purchaseId];

      const childPassengers = boardingPassesGroup.filter((bp) => bp.age < 18);
      const adultPassengers = boardingPassesGroup.filter((bp) => bp.age >= 18);
    }

    res.status(200).json({
      code: 200,
      data: { ...flight, passengers: "" },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: 400,
      errors: "could not connect to db",
    });
  }
};
