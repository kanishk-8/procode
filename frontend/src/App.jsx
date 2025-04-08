import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/unauthenticated/home";
import Login from "./pages/unauthenticated/login";
import SignUp from "./pages/unauthenticated/signup";
import Dashboard from "./pages/authenticated/dashboard";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoutes";
import CodingSpace from "./pages/authenticated/codingSpace";
import SignUp from "./pages/unauthenticated/signup";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codingSpace"
          element={
            <ProtectedRoute>
              <CodingSpace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
