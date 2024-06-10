import dotenv from "dotenv";
import dbconnection from "./db/connection.js";
import { app } from "./app.js";

// Configuration of Package for handling the Environtment Variables.
dotenv.config({
  path: "./env",
});

// Calling the function which will connect to the Database and starts the Express server.
dbconnection()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error occured while starting the Express Server.:", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Express Server is running in the Port.: ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error Occured.: ", error);
    process.exit(1);
  });
