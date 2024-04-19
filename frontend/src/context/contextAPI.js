/**
 * Why do we need Context API?
 * => We need this to send data from one component to another when using props in not an option.
 * This is called State management.
 * Context API is only for react, so there are other libraries like Redux which help manage the State.
 *
 * Redux Toolkit (RTK)
 */

// Creating the context
import React from "react";

const UserContext = React.createContext();

export default UserContext;
