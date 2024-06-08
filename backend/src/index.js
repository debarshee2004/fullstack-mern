import dotenv from "dotenv";
import dbconnection from "./db/connection.js";

dotenv.config({
  path: "./env",
});

dbconnection();
