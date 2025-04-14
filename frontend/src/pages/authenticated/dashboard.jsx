import React from "react";
import StudentDash from "../../components/studentDash";
import TeacherDashboard from "../../components/teacherDashboard"; // added import for teacher component
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  if (user.role === "student") {
    return <StudentDash />;
  } else if (user.role === "teacher") {
    return <TeacherDashboard />; // fixed: now returns TeacherDashboard
  } else {
    return <div>Invalid role</div>; // fixed: returns value
  }
};

export default Dashboard;
