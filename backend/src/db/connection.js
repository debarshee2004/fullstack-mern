import mongoose from "mongoose";
import { DATABASE_NAME } from "../constants.js";
// Always use try-catch and async-await while dealing with database.

/**
 * Database Connection
 *
 * This module defines and exports a function to connect to a MongoDB database using Mongoose.
 * The function `dbconnection` handles the connection to the database and logs the connection status.
 * It uses async/await for handling asynchronous operations and try/catch for error handling.
 *
 * This function connects to MongoDB using Mongoose, utilizing the environment variable
 * `MONGODB_URL` to specify the database URL. It includes the database name specified by
 * the constant `DATABASE_NAME`.
 *
 * @throws {Error} Throws an error if the connection to MongoDB cannot be established.
 */
const dbconnection = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DATABASE_NAME}`
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
