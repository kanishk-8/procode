import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRequestDeletionModal, setShowRequestDeletionModal] =
    useState(false);
  const [deletionMessage, setDeletionMessage] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.GET_BLOG(blogId), {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Blog not found");
        }
        throw new Error("Failed to fetch blog");
      }

      const data = await response.json();
      setBlog(data.blog);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlog = async (status) => {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_BLOG, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: parseInt(blogId),
          status: status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify blog");
      }

      // Close modal and refresh blog
      setShowVerifyModal(false);
      fetchBlog();
    } catch (err) {
      setError("Failed to update blog status: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteBlog = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_BLOG, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: parseInt(blogId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      // Redirect to blogs page
      navigate("/blogs");
    } catch (err) {
      setError("Failed to delete blog: " + err.message);
      console.error(err);
    }
  };

  const handleRequestDeletion = async () => {
    if (!deletionMessage.trim()) {
      setError("Please provide a reason for the deletion request");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REQUEST_DELETION, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: parseInt(blogId),
          message: deletionMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request blog deletion");
      }

      // Close modal and refresh blog
      setShowRequestDeletionModal(false);
      setDeletionMessage("");
      fetchBlog();
    } catch (err) {
      setError("Failed to request blog deletion: " + err.message);
      console.error(err);
    }
  };

  // User can only delete their own blogs
  const canDelete = blog && user && parseInt(user.id) === parseInt(blog.userId);

  // Teachers can request deletion for blogs they don't own
  const canRequestDeletion =
    blog &&
    user &&
    user.role === "teacher" &&
    blog.userId !== user.id &&
    blog.status !== "delete_requested";

  if (loading) {
    return (
      <div className="min-h-screen py-28 px-4 md:px-8 flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading blog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-28 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-zinc-300 mb-6">{error}</p>
            <Link
              to="/blogs"
              className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
            >
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen py-28 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          <Link
            to="/blogs"
            className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/blogs"
            className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Blogs
          </Link>
        </div>

        {blog.status === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <p className="text-yellow-400">
              This blog is pending verification by a teacher and is not publicly
              visible.
              {user?.role === "teacher" && (
                <span className="block mt-2">
                  As a teacher, you can verify or reject this blog.
                </span>
              )}
            </p>
            {user?.role === "teacher" && (
              <div className="mt-4">
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                >
                  Review Blog
                </button>
              </div>
            )}
          </div>
        )}

        {blog.status === "rejected" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-red-400">
              This blog has been rejected by a teacher and is not publicly
              visible.
            </p>
          </div>
        )}

        {blog && blog.status === "delete_requested" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-red-400">
              <span className="font-semibold">Deletion Requested</span> by{" "}
              {blog.deletionRequestedBy}
            </p>
            {blog.deletionMessage && (
              <p className="mt-2 italic text-red-300">
                "{blog.deletionMessage}"
              </p>
            )}
          </div>
        )}

        {blog.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-8 border border-zinc-800">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {blog.status === "verified" && (
              <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full ml-auto">
                Verified{blog.verifiedBy ? ` by ${blog.verifiedBy}` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-zinc-400 mb-8 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span>By {blog.author}</span>
              <span className="text-zinc-600">•</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <span>{blog.readTime}</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-12">
          {/* Render content in paragraphs */}
          {blog.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {(canDelete || canRequestDeletion) && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            <div className="flex flex-wrap gap-4">
              {user?.role === "teacher" && blog?.status === "pending" && (
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                >
                  Verify Blog
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg"
                >
                  Delete Blog
                </button>
              )}

              {canRequestDeletion && (
                <button
                  onClick={() => setShowRequestDeletionModal(true)}
                  className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-colors shadow-lg"
                >
                  Request Deletion
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add a prominent delete button if user owns the blog */}
        {canDelete && (
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Blog Management</h3>
                <p className="text-zinc-400 mt-1">
                  As the author of this blog, you can delete it at any time.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="mt-4 md:mt-0 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg"
              >
                Delete Blog
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verify Blog Modal (for teachers) */}
      {showVerifyModal &&
        user?.role === "teacher" &&
        blog.status === "pending" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Review Blog</h3>
              <p className="mb-6 text-zinc-300">
                Do you want to verify or reject this blog by{" "}
                <span className="font-medium">{blog.author}</span>?
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyBlog("rejected")}
                  className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerifyBlog("verified")}
                  className="px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full hover:bg-green-500/20 transition-colors shadow-lg"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Delete Blog Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Blog</h3>
            <p className="mb-6 text-zinc-300">
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlog}
                className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Deletion Modal (for teachers) */}
      {showRequestDeletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Request Blog Deletion
            </h3>
            <p className="mb-4 text-zinc-300">
              Please provide a reason why this blog should be deleted. The
              author will see this message.
            </p>

            <textarea
              value={deletionMessage}
              onChange={(e) => setDeletionMessage(e.target.value)}
              placeholder="Explain why this blog should be deleted..."
              className="w-full p-3 mb-6 bg-zinc-800/50 border border-zinc-700 rounded-lg h-32"
              required
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRequestDeletionModal(false)}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={!deletionMessage.trim()}
                className={`px-6 py-3 ${
                  !deletionMessage.trim()
                    ? "bg-amber-500/5 text-amber-500/50 border-amber-500/10 cursor-not-allowed"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                } border rounded-full transition-colors shadow-lg`}
              >
                Request Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
