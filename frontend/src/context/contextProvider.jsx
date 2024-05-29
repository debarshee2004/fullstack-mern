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
