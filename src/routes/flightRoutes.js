import { Router } from "express";
import { getFligths } from "../controllers/flightController.js";

const fligthRouter = Router();

fligthRouter.get("/", getFligths);

export default fligthRouter;
