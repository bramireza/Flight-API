import * as flightModel from "../models/flightModel.js";
import * as boardingPassModel from "../models/boardingPassModel.js";
import * as seatModel from "../models/seatModel.js";

// Convert snake_case to camelCase
const snakeToCamelCase = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => snakeToCamelCase(item));
  }

  if (typeof data === "object" && data !== null) {
    const camelCaseData = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelCaseKey = key.replace(/([-_]\w)/g, (match) =>
          match.charAt(1).toUpperCase()
        );
        camelCaseData[camelCaseKey] = snakeToCamelCase(data[key]);
      }
    }

    return camelCaseData;
  }

  return data;
};

// Return a random index in an array
const randomArrayIndex = (array) => Math.floor(Math.random() * array.length);

// Find an available seat adjacent at a companion
const findAvailableSeat = (
  adjacentOffsets,
  companionSeat,
  seatTypeId,
  allSeats,
  occupiedSeats
) => {
  const { seat_row: row, seat_column: column } = companionSeat;
  let availableSeats = [];

  for (const offset of adjacentOffsets) {
    const newRow = row + offset.row;
    const newColumn = String.fromCharCode(column.charCodeAt(0) + offset.column);
    const adjacentSeat = allSeats.find(
      (seat) =>
        seat.seat_row == newRow &&
        seat.seat_column == newColumn &&
        seat.seat_type_id == seatTypeId &&
        !occupiedSeats.has(seat.seat_id)
    );

    if (adjacentSeat) {
      availableSeats.push(adjacentSeat);
    }
  }
  if (!(availableSeats.length > 0)) {
    availableSeats = allSeats.filter(
      (seat) =>
        seat.seat_type_id == seatTypeId && !occupiedSeats.has(seat.seat_id)
    );
  }
  return availableSeats[randomArrayIndex(availableSeats)];
};

// Main function to get check in by flight
export const getFlightCheckin = async (req, res) => {
  try {
    const flightId = parseInt(req.params.id);
    const flight = await flightModel.getFlightById(flightId);

    // Flight not found
    if (!flight) {
      return res.status(404).json({
        code: 404,
        data: {},
      });
    }
    const boardingPass = await boardingPassModel.getBoardingPassByFlightId(
      flightId
    );
    const allSeats = await seatModel.getSeatsByAirplaneId(flight.airplane_id);

    const occupiedSeats = new Set();
    boardingPass.forEach((bp) => {
      if (bp.seat_id) occupiedSeats.add(bp.seat_id);
    });

    // Boarding Pass grouped by purchase
    const groupedBoardingPass = boardingPass.reduce((acc, bp) => {
      if (!acc[bp.purchase_id]) acc[bp.purchase_id] = [];
      acc[bp.purchase_id].push(bp);
      return acc;
    }, {});

    for (let purchaseId in groupedBoardingPass) {
      const boardingPassByPurchase = groupedBoardingPass[purchaseId];

      // Find an adult passenger with seat
      let adultWithSeat = boardingPassByPurchase.find(
        (adult) => adult.seat_id && adult.age >= 18
      );

      // If an adult with a seat not found, assign a random seat to the first adult
      if (!adultWithSeat) {
        const selectedAdult = boardingPassByPurchase.find(
          (adult) => adult.age >= 18
        );
        const availableSeats = allSeats.filter(
          (seat) =>
            !occupiedSeats.has(seat.seat_id) &&
            seat.seat_type_id == selectedAdult.seat_type_id
        );
        const selectedSeat = availableSeats[randomArrayIndex(availableSeats)];

        selectedAdult.seat_id = selectedSeat.seat_id;
        occupiedSeats.add(selectedSeat.seat_id);

        //Assign seat in original array
        const passengerBoardingPass = boardingPass.find(
          (bp) => bp.passenger_id == selectedAdult.passenger_id
        );
        if (passengerBoardingPass) {
          passengerBoardingPass.seat_id = selectedSeat.seat_id;
        }
      }

      // Assign seat all rest passengers
      for (const passenger of boardingPassByPurchase) {
        // Filter adults with a seat to be a possible companion
        let companionsPassenger = boardingPassByPurchase.filter(
          (adult) => adult.seat_id
        );
        companionsPassenger.forEach((companion) => {
          if (
            companion.passenger_id != passenger.passenger_id &&
            !passenger.seat_id
          ) {
            const companionSeat = allSeats.find(
              (seat) => seat.seat_id === companion.seat_id
            );
            if (companionSeat) {
              // ajdacents seat dependes child or adult
              const adjacentOffsets =
                passenger.age < 18
                  ? [
                      { row: 0, column: 1 },
                      { row: 0, column: -1 },
                    ]
                  : [
                      { row: 0, column: 1 },
                      { row: 0, column: -1 },
                      { row: 1, column: 0 },
                      { row: -1, column: 0 },
                    ];
              const selectedSeat = findAvailableSeat(
                adjacentOffsets,
                companionSeat,
                passenger.seat_type_id,
                allSeats,
                occupiedSeats
              );
              if (selectedSeat) {
                // Asign seat to passenger and break de loop
                passenger.seat_id = selectedSeat.seat_id;
                occupiedSeats.add(selectedSeat.seat_id);

                //Assign seat in original array
                const passengerBoardingPass = boardingPass.find(
                  (bp) => bp.passenger_id == passenger.passenger_id
                );
                if (passengerBoardingPass) {
                  passengerBoardingPass.seat_id = selectedSeat.seat_id;
                }
              }
            }
          }
        });
      }
    }

    // Sort boarding pass by seat_id
    boardingPass.sort((a, b) => {
      if (a.seat_id < b.seat_id) return -1;
      if (a.seat_id > b.seat_id) return 1;
      return 0;
    });

    res.status(200).json({
      code: 200,
      data: {
        ...snakeToCamelCase(flight),
        passengers: snakeToCamelCase(boardingPass),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: 400,
      errors: "could not connect to db",
    });
  }
};
