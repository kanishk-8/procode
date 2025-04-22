import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/unauthenticated/home";
import Login from "./pages/unauthenticated/login";
import SignUp from "./pages/unauthenticated/signup";
import Dashboard from "./pages/authenticated/dashboard";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoutes";
import CodingSpace from "./pages/authenticated/codingSpace";
import Batch from "./pages/authenticated/batch";
import ClassRoom from "./pages/authenticated/classroom";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codingSpace/:questionId"
          element={
            <ProtectedRoute>
              <CodingSpace />
            </ProtectedRoute>
          }
        />
        <Route
          path="batch/:batchId"
          element={
            <ProtectedRoute>
              <Batch />
            </ProtectedRoute>
          }
        />
        <Route
          path="classroom"
          element={
            <ProtectedRoute>
              <ClassRoom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
