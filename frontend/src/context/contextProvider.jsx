/**
 * To provide context to the components we need to wrap the children with a Context Provider
 */

import React from "react";
import UserContext from "./contextAPI";

const UserContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  return (
    // The "value" property acts as a props which gives access to the data to all components.
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

// In App.jsx we wrap the children like this:
//
// function App() {
//   return (
//     <UserContextProvider>
//       <h1>Hello World</h1>
//     </UserContextProvider>
//   );
// }
//
// OR
//
// function App() {
//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       <h1>Hello World</h1>
//     </UserContext.Provider>
//   );
// }
