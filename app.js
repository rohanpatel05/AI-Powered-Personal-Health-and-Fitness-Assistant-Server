import express from "express";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "./middlewares/cors.js";
import helmet from "./middlewares/helmet.js";
import getLogger from "./middlewares/logger.js";
import limiter from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import healthMetricsRoutes from "./routes/healthMetricsRoutes.js";

const app = express();

const env = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(cookieParser());
app.use(cors);
app.use(helmet);

app.use(getLogger(env));

app.use(limiter);

app.post("/test", (req, res) => {
  res.status(200).json(req.body);
});

app.get("/test", (req, res) => {
  res.status(200).json("It's working!");
});

if (env !== "test") {
  await connectDB();
}

let baseUrl = "/api";
app.use(baseUrl, authRoutes);
app.use(baseUrl, userRoutes);
app.use(baseUrl, adminRoutes);
app.use(baseUrl, nutritionRoutes);
app.use(baseUrl, workoutRoutes);
app.use(baseUrl, healthMetricsRoutes);

app.use(errorHandler);

export default app;
