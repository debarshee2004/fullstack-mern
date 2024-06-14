import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// Always use try-catch and async-await while dealing with database.

/**
 * Database Connection
 *
 * This module defines and exports a function to connect to a MongoDB database using Mongoose.
 * The function `dbconnection` handles the connection to the database and logs the connection status.
 * It uses async/await for handling asynchronous operations and try/catch for error handling.
 */
const dbconnection = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODBURL}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB Connected Successfully.: ${ConnectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Error Occured.: ", error);
    process.exit(1);
  }
};

export default dbconnection;
