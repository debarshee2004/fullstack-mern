// Docs: https://reactrouter.com/en/main

/**
 * React Router is a library for react which helps us to navigate to other pages of our application.
 * Installation: `npm i react-router-dom`
 *
 * The two components which we will be using is "Link" and "NavLink".
 *
 * Question : Why are we using the Link tag instead of anchor tag?
 * Answer : When we are using anchor tag we are refreshing the page which slows down the user experience,
 * that is why we use "Link" tag because it does not refresh the page. The main purpose of this is to elevate the user experience.
 */

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userId" element={<User />} />
      <Route loader={githubInfoLoader} path="github" element={<Github />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// In Users.tsx we can get the userId from the path

function User() {
  const { userId } = useParams();
  return (
    <div className="bg-gray-600 text-white text-3xl p-4">User: {userId}</div>
  );
}

export default User;
