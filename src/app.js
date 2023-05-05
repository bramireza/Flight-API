import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Middleware to process requests in JSON format
app.use(express.json());

export default app;
