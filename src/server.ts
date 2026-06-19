import http from "http";
import mongoose from "mongoose";
import seedSuperAdmin from "./DB";
import app from "./app";
import { DATABASE_URL, PORT } from "./config";
import { initSocketIO } from "./utils/socket";
import 'dotenv/config';

const server = http.createServer(app);
initSocketIO(server);

async function main() {
  try {
    await mongoose.connect(DATABASE_URL as string,);
    console.log("mongodb connected successfully");
    await seedSuperAdmin();
    server.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
    
     
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error(`😈 unhandledRejection is detected, shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
process.on("uncaughtException", (error) => {
  console.error(`😈 uncaughtException is detected, shutting down ...`, error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});


