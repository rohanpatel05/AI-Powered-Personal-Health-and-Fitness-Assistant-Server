import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  mongoose
    .connect(MONGODB_URI, {
      minPoolSize: 10,
      maxPoolSize: 50,
    })
    .then(() => {
      console.log("Successfully connected to the DB!");
    })
    .catch((err) => {
      console.error("Error connecting to the DB:", err);

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `Retrying connection (attempt ${retryCount}) in 5 seconds...`
        );
        setTimeout(connectDB, 5000);
      } else {
        console.error("Max retry attempts reached. Exiting...");
        process.exit(1);
      }
    });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from the DB:", error);
  }
};
export { connectDB, disconnectDB };
