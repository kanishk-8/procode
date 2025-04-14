import { Link, useParams, Outlet } from "react-router-dom";

function Batch() {
  const { batchId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2>Batch ID: {batchId}</h2>
      <Link to={`/codingSpace/1`}>
        <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded ml-4">
          Go to Coding Space
        </button>
      </Link>
      {/* Additional batch content */}
      <Outlet />
    </div>
  );
}

export default Batch;
