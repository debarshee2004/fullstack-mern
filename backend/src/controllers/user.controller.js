import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";

const registerUser = AsyncFnHandler(async (req, res) => {
  res.status(200).json({
    message: "User Register Successful.",
  });
});

export { registerUser };
