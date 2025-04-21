import { Link, useParams, Outlet } from "react-router-dom";
import ClassPage from "../../components/classpage";

function Batch() {
  const { batchId } = useParams();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Batch ID: {batchId}</h2>
          <Link to={`/codingSpace/1`}>
            <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
              Go to Coding Space
            </button>
          </Link>
        </div>
        <ClassPage />
        <Outlet />
      </div>
    </div>
  );
}

export default Batch;
