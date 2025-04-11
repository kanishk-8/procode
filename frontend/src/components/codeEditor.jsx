import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
  const editorRef = useRef(null);
  const [languageId, setLanguageId] = useState("71");
  const [output, setOutput] = useState("");

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = editorRef.current.getValue();

    try {
      const response = await fetch("http://localhost:8080/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: languageId,
        }),
      });

      const data = await response.text();
      setOutput(data);
    } catch (error) {
      setOutput("Error: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label
              htmlFor="language"
              className="block mb-1 font-medium text-white"
            >
              Select Language:
            </label>
            <select
              id="language"
              className="p-2 border rounded-md text-white"
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
            >
              <option value="71">Python 3</option>
              <option value="54">C++ (GCC 9.2.0)</option>
              {/* Add more language options here */}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Run Code
          </button>
        </div>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <Editor
            height="400px"
            width="100%"
            defaultLanguage="python"
            defaultValue="# Write your code here"
            theme="vs-dark"
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <div className=" border border-gray-300 p-4 rounded whitespace-pre-wrap">
          {output}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
