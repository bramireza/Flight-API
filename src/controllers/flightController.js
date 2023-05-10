import * as flightModel from "../models/flightModel.js";
import * as boardingPassModel from "../models/boardingPassModel.js";
import * as seatModel from "../models/seatModel.js";

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

export const getFlightCheckin = async (req, res) => {
  try {
    const flightId = parseInt(req.params.id);
    const flight = await flightModel.getFlightById(flightId);
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

    const groupedBoardingPass = boardingPass.reduce((acc, bp) => {
      if (!acc[bp.purchase_id]) acc[bp.purchase_id] = [];
      acc[bp.purchase_id].push(bp);
      return acc;
    }, {});

    for (let purchaseId in groupedBoardingPass) {
      const boardingPassByPurchase = groupedBoardingPass[purchaseId];
      const childPassengers = boardingPassByPurchase.filter(
        (bp) => bp.age < 18
      );
      const adultPassengers = boardingPassByPurchase.filter(
        (bp) => bp.age >= 18
      );
      let adultWithSeat = adultPassengers.find((adult) => adult.seat_id);

      if (!adultWithSeat) {
        const selectedAdult = adultPassengers.shift();
        const availableSeats = allSeats.filter(
          (seat) =>
            !occupiedSeats.has(seat.seat_id) &&
            seat.seat_type_id == selectedAdult.seat_type_id
        );
        const randomSeatIndex = Math.floor(
          Math.random() * availableSeats.length
        );
        const selectedSeat = availableSeats[randomSeatIndex];
        selectedAdult.seat_id = selectedSeat.seat_id;
        occupiedSeats.add(selectedSeat.seat_id);
        adultWithSeat = selectedAdult;
        const passengerBoardingPass = boardingPass.find(
          (bp) => bp.passenger_id == selectedAdult.passenger_id
        );
        if (passengerBoardingPass) {
          passengerBoardingPass.seat_id = selectedSeat.seat_id;
        }
      }

      const unassignedAdults = adultPassengers.filter(
        (adult) => !adult.seat_id
      );
      for (const passenger of [...childPassengers, ...unassignedAdults]) {
        let companion = adultWithSeat;
        if (companion) {
          const companionSeat = allSeats.find(
            (seat) => seat.seat_id === companion.seat_id
          );

          if (companionSeat) {
            const { seat_row: row, seat_column: column } = companionSeat;
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

            let selectedSeat = null;

            for (const offset of adjacentOffsets) {
              const newRow = row + offset.row;
              const newColumn = String.fromCharCode(
                column.charCodeAt(0) + offset.column
              );
              const adjacentSeat = allSeats.find(
                (seat) =>
                  seat.seat_row == newRow &&
                  seat.seat_column == newColumn &&
                  seat.seat_type_id == passenger.seat_type_id
              );

              if (adjacentSeat && !occupiedSeats.has(adjacentSeat.seat_id)) {
                selectedSeat = adjacentSeat;
                break;
              }
            }

            if (!selectedSeat) {
              const availableSeats = allSeats.filter(
                (seat) =>
                  seat.seat_type_id == passenger.seat_type_id &&
                  !occupiedSeats.has(seat.seat_id)
              );
              const randomSeatIndex = Math.floor(
                Math.random() * availableSeats.length
              );
              selectedSeat = availableSeats[randomSeatIndex];
              console.log(passenger);
            }

            occupiedSeats.add(selectedSeat.seat_id);
            const passengerBoardingPass = boardingPass.find(
              (bp) => bp.passenger_id == passenger.passenger_id
            );
            if (passengerBoardingPass) {
              passengerBoardingPass.seat_id = selectedSeat.seat_id;
            }
          }
        }
      }
    }

    // Sort boarding pass by seat_id
    boardingPass.sort((a, b) => {
      if (a.seat_id < b.seat_id) return -1;
      if (a.seat_id > b.seat_id) return 1;
      return 0;
    });
    allSeats.filter((seat) => !occupiedSeats.has(seat.seat_id));
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
