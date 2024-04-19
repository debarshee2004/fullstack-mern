import { configureStore } from "@reduxjs/toolkit"; // This is used to create the store for the Application
import todoReducer from "../features/todo/todoSlice"; // Library which creates and maintains the reducers

export const store = configureStore({
  reducer: todoReducer,
});
