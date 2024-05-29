import { configureStore } from "@reduxjs/toolkit"; // This is used to create the store for the Application
import todoReducer from "./todoSlice"; // Library which creates and maintains the reducers

export const store = configureStore({
  reducer: todoReducer,
});

// How to wrap the Application with the store
<Provider store={store}>
  <App />
</Provider>;
