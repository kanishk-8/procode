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
import BatchTeacher from "./pages/authenticated/batch_teacher";
import EvalStudentDetail from "./pages/authenticated/evalStudentDetail";
import Blogs from "./pages/authenticated/blogs";
import BlogDetail from "./pages/authenticated/blogDetail";

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
          path="/codingSpace/:batchId/:questionId"
          element={
            <ProtectedRoute>
              <CodingSpace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evalStudentDetail/:batchId/:questionId"
          element={
            <ProtectedRoute>
              <EvalStudentDetail />
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
          path="batchTeacher/:batchId"
          element={
            <ProtectedRoute>
              <BatchTeacher />
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
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:blogId"
          element={
            <ProtectedRoute>
              <BlogDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
