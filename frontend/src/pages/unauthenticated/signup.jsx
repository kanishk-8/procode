import React from "react";

const SignUp = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [role, setRole] = React.useState("student"); // Default to student
  const RegisterHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, userId, role }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Signed up:", data);
        window.location.href = "/login"; // Redirect to login after successful signup
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
        <form className="space-y-4" onSubmit={RegisterHandler}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <input
            type="text"
            placeholder={role === "teacher" ? "Teacher ID" : "Student ID"}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
