import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const BlogCard = ({ blog, onVerifyClick, onDeleteClick, currentUser }) => {
  const userId =
    currentUser &&
    (currentUser.id || currentUser.ID || currentUser.userId || currentUser._id);
  const blogUserId = blog && (blog.userId || blog.UserID || blog.user_id);

  const canVerify =
    currentUser?.role === "teacher" &&
    blog.status === "pending" &&
    onVerifyClick;

  const canDelete =
    userId && blogUserId && parseInt(userId) === parseInt(blogUserId);

  console.log({
    blogUserId: blogUserId,
    currentUserId: userId,
    userCanDelete: canDelete,
    blog: blog,
    currentUser: currentUser,
  });

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all">
      {blog.imageUrl ? (
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-500">No image</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {blog.status === "verified" && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-auto">
              Verified{blog.verifiedBy ? ` by ${blog.verifiedBy}` : ""}
            </span>
          )}
          {blog.status === "pending" && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded ml-auto">
              Pending Review
            </span>
          )}
          {blog.status === "delete_requested" && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded ml-auto">
              Deletion Requested
            </span>
          )}
        </div>

        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-2">
            <Link
              to={`/blog/${blog.id}`}
              className="hover:text-blue-400 transition-colors"
            >
              {blog.title}
            </Link>
          </h3>

          <div className="flex space-x-2">
            {canVerify && (
              <button
                onClick={() => onVerifyClick(blog)}
                className="text-blue-400 hover:text-blue-500 transition-colors p-1"
                aria-label="Verify blog"
                title="Verify blog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDeleteClick(blog)}
                className="text-red-400 hover:text-red-500 transition-colors p-1"
                aria-label="Delete blog"
                title="Delete blog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="text-zinc-400 mb-4">{blog.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{blog.author}</span>
          <div className="flex items-center gap-4">
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>{blog.readTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Blogs = () => {
  const { user } = useAuth();
  console.log("User from auth context:", user);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [filter, setFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    tags: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.GET_ALL_BLOGS, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();

      // Check if the data has the expected structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      // Initialize blogs as an empty array if it's missing in the response
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      setError(null);
    } catch (err) {
      console.error("Blog fetch error:", err);
      setError("Failed to load blogs: " + err.message);
      // Ensure blogs is always an array even in error case
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBlogs = () => {
    // Make sure blogs is always treated as an array
    const blogsArray = Array.isArray(blogs) ? blogs : [];

    // Return early if blogs array is empty
    if (blogsArray.length === 0) return [];

    return blogsArray.filter((blog) => {
      // Skip invalid blog objects
      if (!blog) return false;

      // Fix status filter
      if (filter !== "all" && blog.status !== filter) {
        return false;
      }

      // Fix creator filter - ensure we're comparing the correct user ID values
      if (creatorFilter === "mine" && user) {
        const userId = user.id || user.ID || user.userId || user._id;
        const blogUserId = blog.userId || blog.UserID || blog.user_id;

        // Debug the values to help identify issues
        console.log("Filtering mine:", {
          blogUserId: blogUserId,
          userId: userId,
          match:
            userId && blogUserId && parseInt(userId) === parseInt(blogUserId),
        });

        // Only show blogs where the user ID matches
        if (
          !userId ||
          !blogUserId ||
          parseInt(userId) !== parseInt(blogUserId)
        ) {
          return false;
        }
      }

      return true;
    });
  };

  // Add safe access to filteredBlogs
  const filteredBlogs = getFilteredBlogs() || [];

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    // Add validation for required tags
    if (!newBlog.tags.trim()) {
      setError("Please add at least one tag");
      return;
    }

    try {
      const tagsArray = newBlog.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      // Additional validation for empty tags after processing
      if (tagsArray.length === 0) {
        setError("Please add at least one valid tag");
        return;
      }

      const response = await fetch(API_ENDPOINTS.CREATE_BLOG, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newBlog.title,
          content: newBlog.content,
          excerpt: newBlog.excerpt,
          imageUrl: newBlog.imageUrl,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog");
      }

      const data = await response.json();

      setNewBlog({
        title: "",
        content: "",
        excerpt: "",
        imageUrl: "",
        tags: "",
      });
      setShowCreateModal(false);

      if (data.status === "verified") {
        setError(null);
      } else {
        setError(null);
      }

      fetchBlogs();
    } catch (err) {
      setError("Failed to create blog: " + err.message);
      console.error(err);
    }
  };

  const handleVerifyBlog = async (status) => {
    if (!selectedBlog) return;

    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_BLOG, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: selectedBlog.id,
          status: status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify blog");
      }

      setShowVerifyModal(false);
      setSelectedBlog(null);
      fetchBlogs();
    } catch (err) {
      setError("Failed to update blog status: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_BLOG, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: blogToDelete.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      setShowDeleteModal(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (err) {
      setError("Failed to delete blog: " + err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Update header section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">
              ProCode Blog
            </h1>
            <p className="text-zinc-400">
              Stay updated with the latest in programming and technology
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full sm:w-44 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white appearance-none pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                  aria-label="Filter blog status"
                  style={{ color: "white", backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <option value="all" style={{ color: "white", backgroundColor: "rgba(30, 30, 30, 0.95)" }}>All Blogs</option>
                  <option value="verified" style={{ color: "white", backgroundColor: "rgba(30, 30, 30, 0.95)" }}>Verified Only</option>
                  {user?.role === "teacher" && (
                    <option value="pending" style={{ color: "white", backgroundColor: "rgba(30, 30, 30, 0.95)" }}>Pending Review</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {user && (
                <div className="relative w-full sm:w-auto">
                  <select
                    value={creatorFilter}
                    onChange={(e) => setCreatorFilter(e.target.value)}
                    className="w-full sm:w-44 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white appearance-none pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                    aria-label="Filter by author"
                    style={{ color: "white", backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <option value="all" style={{ color: "white", backgroundColor: "rgba(30, 30, 30, 0.95)" }}>All Authors</option>
                    <option value="mine" style={{ color: "white", backgroundColor: "rgba(30, 30, 30, 0.95)" }}>My Blogs</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg whitespace-nowrap"
              >
                Create Blog
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-zinc-400">Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <p className="text-xl text-zinc-400">No blogs match your filters</p>
            {user && filter === "all" && creatorFilter === "all" && (
              <p className="text-zinc-500 mt-2">
                Be the first to create a blog post!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id || `blog-${Math.random()}`} // Ensure a key is always provided
                blog={blog}
                currentUser={user}
                onVerifyClick={
                  user?.role === "teacher" && blog.status === "pending"
                    ? () => {
                        setSelectedBlog(blog);
                        setShowVerifyModal(true);
                      }
                    : undefined
                }
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <h3 className="text-2xl font-semibold mb-6">Create New Blog</h3>

            <form onSubmit={handleCreateBlog} className="space-y-6">
              <div>
                <label className="block text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, title: e.target.value })
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Content</label>
                <textarea
                  value={newBlog.content}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, content: e.target.value })
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg h-64"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Excerpt (optional, brief summary)
                </label>
                <textarea
                  value={newBlog.excerpt}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, excerpt: e.target.value })
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg h-24"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={newBlog.imageUrl}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, imageUrl: e.target.value })
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Tags (comma separated) *
                </label>
                <input
                  type="text"
                  value={newBlog.tags}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, tags: e.target.value })
                  }
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg"
                  placeholder="e.g. JavaScript, React, Programming"
                  required
                />
                <p className="text-zinc-500 text-sm mt-1">
                  At least one tag is required. Separate multiple tags with
                  commas.
                </p>
              </div>

              {user?.role === "student" ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400">
                    Note: As a student, your blog will need to be verified by a
                    teacher before it appears publicly.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400">
                    As a teacher, your blog will be automatically verified upon
                    publication.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg"
                >
                  Publish Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && selectedBlog && user?.role === "teacher" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Verify Blog</h3>
            <p className="mb-6 text-zinc-300">
              Do you want to verify or reject the blog titled{" "}
              <span className="font-medium text-white">
                "{selectedBlog.title}"
              </span>{" "}
              by <span className="font-medium">{selectedBlog.author}</span>?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Cancel
              </button>

              {selectedBlog.status === "pending" && (
                <>
                  <button
                    onClick={() => handleVerifyBlog("rejected")}
                    className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors shadow-lg"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyBlog("verified")}
                    className="px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors shadow-lg"
                  >
                    Verify
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && blogToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Blog</h3>
            <p className="mb-6 text-zinc-300">
              Are you sure you want to delete "{blogToDelete.title}"? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlog}
                className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
