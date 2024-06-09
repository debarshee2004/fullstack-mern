import dotenv from "dotenv";
import dbconnection from "./db/connection.js";
import { app } from "./app.js";

// Configuration for the Environtment Variables.
dotenv.config({
  path: "./env",
});

// Functions which connect to the Database and starts the Express server.
dbconnection()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error Occured:", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running in the Port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed.", error);
  });
