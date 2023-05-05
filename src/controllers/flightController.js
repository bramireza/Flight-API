import { getFligth } from "../models/flightModel.js";

export const getFligths = async (_, res, next) => {
  try {
    const passengers = await getFligth();
    res.status(200).json(passengers);
  } catch (error) {
    next(error);
  }
};
