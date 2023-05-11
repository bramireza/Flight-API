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
      if (key.includes("_")) {
        const camelCaseKey = key.replace(/([-_]\w)/g, (match) =>
          match.charAt(1).toUpperCase()
        );
        camelCaseData[camelCaseKey] = snakeToCamelCase(data[key]);
      } else {
        camelCaseData[key] = data[key];
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
  let availableSeats = adjacentOffsets.reduce((acc, offset) => {
    const newRow = row + offset.row;
    const newColumn = String.fromCharCode(column.charCodeAt(0) + offset.column);
    const adjacentSeat = allSeats.find(
      (seat) =>
        seat.seat_row === newRow &&
        seat.seat_column === newColumn &&
        seat.seat_type_id === seatTypeId &&
        !occupiedSeats.has(seat.seat_id)
    );

    if (adjacentSeat) acc.push(adjacentSeat);

    return acc;
  }, []);

  return availableSeats.length > 0
    ? availableSeats[randomArrayIndex(availableSeats)]
    : null;
};

// Find the first adult passenger with a seat
const findAdultWithSeat = (boardingPass) =>
  boardingPass.find((adult) => adult.seat_id && adult.age >= 18);

// Find the first adult passenger
const findFirstAdult = (boardingPass) =>
  boardingPass.find((passenger) => passenger.age >= 18);

// Assign Seat to Passenger
const assignSeatToPassenger = (
  passenger,
  selectedSeat,
  occupiedSeats,
  boardingPass
) => {
  // Asign seat to passenger
  passenger.seat_id = selectedSeat.seat_id;
  occupiedSeats.add(selectedSeat.seat_id);

  //Assign seat in original array
  const passengerBoardingPass = boardingPass.find(
    (bp) => bp.passenger_id === passenger.passenger_id
  );

  if (passengerBoardingPass) {
    passengerBoardingPass.seat_id = selectedSeat.seat_id;
  }
};

// Remove key flightId from boardingPass
const removeFlightIdFromBoardingPass = (boardingPass) => {
  return boardingPass.map((pass) => {
    const { flight_id, ...rest } = pass;
    return rest;
  });
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

    const occupiedSeats = new Set(
      boardingPass.filter((bp) => bp.seat_id).map((bp) => bp.seat_id)
    );

    // Boarding Pass grouped by purchase
    const groupedBoardingPass = boardingPass.reduce((acc, bp) => {
      if (!acc[bp.purchase_id]) acc[bp.purchase_id] = [];
      acc[bp.purchase_id].push(bp);
      return acc;
    }, {});

    for (let purchaseId in groupedBoardingPass) {
      const boardingPassByPurchase = groupedBoardingPass[purchaseId];

      const adultWithSeat = findAdultWithSeat(boardingPassByPurchase);

      // Assign seat to adult without seat
      if (!adultWithSeat) {
        const selectedAdult = findFirstAdult(boardingPassByPurchase);

        const availableSeats = allSeats.filter(
          (seat) =>
            !occupiedSeats.has(seat.seat_id) &&
            seat.seat_type_id == selectedAdult.seat_type_id
        );
        const selectedSeat = availableSeats[randomArrayIndex(availableSeats)];

        if (selectedAdult)
          assignSeatToPassenger(
            selectedAdult,
            selectedSeat,
            occupiedSeats,
            boardingPass
          );
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
                assignSeatToPassenger(
                  passenger,
                  selectedSeat,
                  occupiedSeats,
                  boardingPass
                );
              }
            }
          }
        });

        // Assign seat to passenger when there are no adjacent seats
        if (!passenger.seat_id) {
          let availableSeats = allSeats.filter(
            (seat) =>
              seat.seat_type_id == passenger.seat_type_id &&
              !occupiedSeats.has(seat.seat_id)
          );

          let selectedSeat = availableSeats[randomArrayIndex(availableSeats)];
          if (selectedSeat) {
            assignSeatToPassenger(
              passenger,
              selectedSeat,
              occupiedSeats,
              boardingPass
            );
          }
        }
      }
    }

    // Sort boarding pass by seat_id
    boardingPass.sort((a, b) =>
      a.seat_id < b.seat_id ? -1 : a.seat_id > b.seat_id ? 1 : 0
    );

    const newBoardingPass = removeFlightIdFromBoardingPass(boardingPass);

    res.status(200).json({
      code: 200,
      data: {
        ...snakeToCamelCase(flight),
        passengers: snakeToCamelCase(newBoardingPass),
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
