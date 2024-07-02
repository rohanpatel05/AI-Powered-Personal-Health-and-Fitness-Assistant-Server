import "dotenv/config";
import app from "./app.js";
import { disconnectDB } from "./config/db.js";

const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing server...");
  server.close(() => {
    console.log("Server closed");
    disconnectDB();
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Closing server...");
  server.close(() => {
    console.log("Server closed");
    disconnectDB();
    process.exit(0);
  });
});
