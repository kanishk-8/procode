import React from "react";
import Hero from "../../components/hero";
import Contact from "../../components/contact";

const Home = () => {
  return (
    <div className="min-h-screen">
      <div className="w-screen flex h-[30vw] justify-center py-10 mt-16 ">
        <Hero />
      </div>
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6 text-center">
            Welcome to ProCode
          </h2>
          <p className="text-xl text-center mb-12">
            A comprehensive platform for learning, assessment, and student
            management.
          </p>
          <div className="flex flex-col md:flex-row justify-around">
            <div className="mb-8 md:mb-0 md:w-1/3 text-center">
              <h3 className="text-2xl font-semibold mb-4">Students</h3>
              <p>
                Empower your learning journey with personalized courses,
                assessments, and real-time progress tracking.
              </p>
            </div>
            <div className="mb-8 md:mb-0 md:w-1/3 text-center">
              <h3 className="text-2xl font-semibold mb-4">Teachers</h3>
              <p>
                Monitor student progress, provide timely feedback, and share
                course materials seamlessly.
              </p>
            </div>
            <div className="md:w-1/3 text-center">
              <h3 className="text-2xl font-semibold mb-4">Administration</h3>
              <p>
                Manage students, teachers, and course data easily to keep your
                institution organized.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <a
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
      <Contact />
    </div>
  );
};

export default Home;
