# React Router DOM

React Router DOM is a powerful library for handling client-side routing in React applications. It enables navigation between different components without triggering a full page reload, creating a seamless single-page application (SPA) experience. This guide explains how to set up and use React Router DOM, with examples to illustrate key concepts like basic routing, dynamic routes, and navigation.

## Installation

To use React Router DOM, install it via npm or yarn in your React project.

```sh
npm install react-router-dom
```

This command adds the `react-router-dom` package, which provides components and hooks for routing.

## Implementation

To set up routing, you need to configure a router in your main application file (e.g., `main.tsx`) and provide it to your app using `RouterProvider`. The `createBrowserRouter` function creates a router instance that works with the browser's history API.

**Example: Setting Up the Router**: In your `main.tsx`, initialize the router and render it with `RouterProvider`. Wrap the app in `StrictMode` for development checks.

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Dashboard from "./Dashboard";
import About from "./About";
import NotFoundPage from "./NotFoundPage";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/about", element: <About /> },
  { path: "*", element: <NotFoundPage /> }, // Wildcard for 404 pages
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

**Explanation**:

- `createBrowserRouter` defines routes as an array of objects, each mapping a `path` to an `element` (a React component).
- The `path: "*"` route acts as a catch-all for undefined routes, rendering a 404 page.
- `RouterProvider` makes the router available to the entire app.
- Replace `createRoute` with `createRoot` (as shown above) for correct React DOM rendering.

## Link Components

The `Link` component from `react-router-dom` enables navigation without full page refreshes. It renders as an `<a>` tag but uses the router’s history API to update the URL and render the appropriate component.

**Example: Using Link for Navigation**: In a 404 page, you might provide a button to navigate back to the home page.

```tsx
// NotFoundPage.tsx
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">
        <button>Go back to Home</button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
```

**Explanation**:

- The `Link` component’s `to` prop specifies the target route (e.g., `"/"` for the home page).
- Clicking the button navigates to the home page without reloading the browser.
- This approach ensures a smooth user experience compared to traditional `<a>` tags.

## Dynamic Routes

Dynamic routes allow you to create flexible URLs that include parameters, such as user IDs in a profile page. Use the `useParams` hook to access these parameters in your components.

**Example: Setting Up a Dynamic Route**: Define a route with a parameter (e.g., `:id`) in the router configuration.

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProfilePage from "./ProfilePage";

const router = createBrowserRouter([
  { path: "/profile/:id", element: <ProfilePage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

**Example: Generating Links to Dynamic Routes**: Create a component that lists users and links to their profile pages using dynamic routes.

```tsx
// ProfileList.tsx
import { Link } from "react-router-dom";

const ProfileList = () => {
  const users = [
    { id: 1, name: "Joe" },
    { id: 2, name: "Coe" },
    { id: 3, name: "Doe" },
  ];

  return (
    <div>
      <h1>Profile List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/profile/${user.id}`}>
              <h2>{user.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileList;
```

**Explanation**:

- The `Link` component’s `to` prop dynamically constructs the URL (e.g., `/profile/1` for user ID 1).
- The `key` prop ensures efficient rendering of the list.
- Clicking a user’s name navigates to their profile page.

**Example: Accessing Route Parameters**: In the profile page component, use `useParams` to retrieve the `id` from the URL.

```tsx
// ProfilePage.tsx
import { useParams } from "react-router-dom";

const ProfilePage = () => {
  const { id } = useParams(); // Extracts the 'id' from the URL

  return (
    <div>
      <h1>User Profile {id}</h1>
      <p>This is the profile page for user ID: {id}</p>
    </div>
  );
};

export default ProfilePage;
```

**Explanation**:

- `useParams` returns an object containing the dynamic parameters (e.g., `{ id: "1" }` for `/profile/1`).
- Use the `id` to display user-specific content or fetch data from an API.
- This approach is ideal for pages like user profiles, product details, or blog posts.

## Additional Notes

- **Nested Routes**: For complex layouts, define nested routes using the `children` property in `createBrowserRouter`. This is useful for dashboards with sidebars or tabs.

```tsx
// main.tsx
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> }, // Default route for /dashboard
      { path: "profile", element: <ProfilePage /> }, // /dashboard/profile
      { path: "settings", element: <SettingsPage /> }, // /dashboard/settings
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
```

```tsx
// Another Format
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userid" element={<User />} />
      <Route loader={githubInfoLoader} path="github" element={<Github />} />
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);
```

- **Navigation Hooks**: Beyond `useParams`, explore `useNavigate` for programmatic navigation (e.g., redirecting after form submission).

```tsx
// FormPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FormPage = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Navigate to welcome page with name in state
      navigate("/welcome", { state: { name } });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Enter Your Name</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <button type="submit" disabled={!name.trim()}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormPage;
```

- **Route Protection**: Implement protected routes by using a wrapper component that checks authentication before rendering the `element`.

```tsx
// ProtectedRoute.tsx
import { useAuth } from "./AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login, preserving the attempted URL
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};
```

```tsx
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
```

- **Resources**: Refer to the [React Router Docs](https://reactrouter.com/) for advanced topics like loaders, actions, and error boundaries.

This updated guide includes detailed explanations and practical examples to help you understand and implement React Router DOM effectively. Practice these concepts by building a small app with multiple routes and dynamic parameters.
