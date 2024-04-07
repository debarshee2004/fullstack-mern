/**
 * When we are using same components in multiple pages it is not good practice to import those components to multiple pages.
 * To get around this issue we use React Router Outlet for display the changing components while keeping the rest fixed.
 */

import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;
