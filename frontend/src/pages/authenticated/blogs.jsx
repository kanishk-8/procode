import React from "react";

const dummyBlogs = [
  {
    id: 1,
    title: "Getting Started with Data Structures",
    author: "John Doe",
    date: "2024-01-15",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/dsa/400/250",
    excerpt:
      "Learn the fundamentals of data structures and why they're crucial for programming.",
    tags: ["DSA", "Programming", "Beginners"],
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    author: "Jane Smith",
    date: "2024-01-12",
    readTime: "8 min read",
    image: "https://picsum.photos/seed/js/400/250",
    excerpt:
      "Deep dive into closures, prototypes, and the event loop in JavaScript.",
    tags: ["JavaScript", "Web Development", "Advanced"],
  },
  {
    id: 3,
    title: "System Design Basics",
    author: "Mike Johnson",
    date: "2024-01-10",
    readTime: "10 min read",
    image: "https://picsum.photos/seed/system/400/250",
    excerpt: "Understanding the fundamentals of designing scalable systems.",
    tags: ["System Design", "Architecture", "Backend"],
  },
  {
    id: 1,
    title: "Getting Started with Data Structures",
    author: "John Doe",
    date: "2024-01-15",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/dsa/400/250",
    excerpt:
      "Learn the fundamentals of data structures and why they're crucial for programming.",
    tags: ["DSA", "Programming", "Beginners"],
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    author: "Jane Smith",
    date: "2024-01-12",
    readTime: "8 min read",
    image: "https://picsum.photos/seed/js/400/250",
    excerpt:
      "Deep dive into closures, prototypes, and the event loop in JavaScript.",
    tags: ["JavaScript", "Web Development", "Advanced"],
  },
  {
    id: 3,
    title: "System Design Basics",
    author: "Mike Johnson",
    date: "2024-01-10",
    readTime: "10 min read",
    image: "https://picsum.photos/seed/system/400/250",
    excerpt: "Understanding the fundamentals of designing scalable systems.",
    tags: ["System Design", "Architecture", "Backend"],
  },
  // Add more dummy blogs as needed
];

const BlogCard = ({ blog }) => (
  <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all">
    <img
      src={blog.image}
      alt={blog.title}
      className="w-full h-48 object-cover"
    />
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
      </div>
      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
      <p className="text-zinc-400 mb-4">{blog.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{blog.author}</span>
        <div className="flex items-center gap-4">
          <span>{blog.date}</span>
          <span>{blog.readTime}</span>
        </div>
      </div>
    </div>
  </div>
);

const Blogs = () => {
  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">ProCode Blog</h1>
          <p className="text-zinc-400">
            Stay updated with the latest in programming and technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
