import React from "react";

const Contact = () => {
  return (
    <div className="container w-1/2 mx-auto p-4 bg-white/10 backdrop-blur-lg rounded-4xl mb-7">
      <h2 className="text-4xl font-bold mb-6 text-center">Contact Us</h2>
      <form className="max-w-xl mx-auto">
        <div className="mb-4">
          <label className="block text-lg mb-2">Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded"
            placeholder="Your Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Email</label>
          <input
            type="email"
            className="w-full p-3 border rounded"
            placeholder="Your Email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Message</label>
          <textarea
            className="w-full p-3 border rounded"
            placeholder="Your Message"
            rows="4"
          ></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
