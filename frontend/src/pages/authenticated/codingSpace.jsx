import React from "react";
import { useParams, Outlet } from "react-router-dom";
import CodeEditor from "../../components/codeEditor";

const CodingSpace = () => {
  const { questionId } = useParams();
  return (
    <div className="h-screen w-screen p-10 mt-16 flex ">
      <div className="flex justify-between items-center my-4 h-[80%] w-[30%] border-2 border-gray-500 rounded-lg p-4">
        <h1>question: {questionId}</h1>
      </div>
      <CodeEditor />
      <Outlet />
    </div>
  );
};

export default CodingSpace;
