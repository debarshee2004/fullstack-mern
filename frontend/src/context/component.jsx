import { useState, useContext } from "react";
import UserContext from "../context/UserContext";

// How to send the Data
function SetData() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Creating a setUser object by which we will send the data.
  const { setUser } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({ username, password });
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

SetData();

// How to display the Data
const GetData = () => {
  const { user } = useContext(UserContext);
  if (!user) return <div>please login</div>;
  return <div>Welcome {user.username}</div>;
};

GetData();
