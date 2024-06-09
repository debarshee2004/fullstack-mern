import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// Always use try-catch and async-await while dealing with database.

// The function `dbconnection` connects to the MongoDB Database.
const dbconnection = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODBURL}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB Connected Successfully: ${ConnectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default dbconnection;
