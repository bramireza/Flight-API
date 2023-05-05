import express from "express";
import dotenv from "dotenv";
import { router } from "./routes/index.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware to process requests in JSON format
app.use(express.json());

// All routes
router(app);

export default app;
