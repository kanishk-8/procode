import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    // Mock login logic
    if (username && password) {
      login({ username }); // You can add more fields like email, role, etc.
      console.log("Logged in as:", username);
    } else {
      alert("Please enter username and password");
    }
  };

  return (
    <div className="h-screen w-screen bg-red-100">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Login Page</h1>
        <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="p-2 border border-gray-300 rounded"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border border-gray-300 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
