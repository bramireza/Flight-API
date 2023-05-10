import { Router } from "express";
import * as flightController from "../controllers/flightController.js";

const fligthRouter = Router();

fligthRouter.get("/:id/passengers", flightController.getFlightCheckin);

export default fligthRouter;
