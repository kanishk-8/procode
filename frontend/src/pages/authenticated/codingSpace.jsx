import React from "react";
import { useParams, Outlet } from "react-router-dom";
import CodeEditor from "../../components/codeEditor";

const CodingSpace = () => {
  const { questionId } = useParams();
  return (
    <div className="h-screen w-screen p-10 mt-16">
      <div className="flex justify-between items-center mb-4">
        <h1>question: {questionId}</h1>
      </div>
      <CodeEditor />
      <Outlet />
    </div>
  );
};

export default CodingSpace;
