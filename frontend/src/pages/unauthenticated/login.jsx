import React from "react";

const Login = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const Login = (username, password) => {
    // Implement your login logic here
    console.log("Logging in with", username, password);
  };
  return (
    <div className="h-screen w-screen bg-red-100">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Login Page</h1>
        <form className="flex flex-col space-y-4">
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
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onSubmit={Login()}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
