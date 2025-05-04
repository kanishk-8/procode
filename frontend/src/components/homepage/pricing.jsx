import React from "react";

const Pricing = () => {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-6 text-center">Pricing Plans</h2>
        <p className="text-xl text-center mb-12">
          Choose the plan that works best for your needs
        </p>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Free Plan */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col md:w-1/4">
            <h3 className="text-2xl font-bold mb-2 text-center">Free</h3>
            <p className="text-4xl font-bold text-center mb-6">
              ₹0<span className="text-lg">/month</span>
            </p>
            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Basic code assessments
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                5 classrooms limit
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Limited reporting
              </li>
            </ul>
            <a
              href="/signup"
              className="mt-auto text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-8 flex flex-col md:w-1/4 transform scale-105 shadow-xl">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center">Pro</h3>
            <p className="text-4xl font-bold text-center mb-6">
              ₹999<span className="text-lg">/month</span>
            </p>
            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Advanced assessments
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Unlimited classrooms
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Detailed analytics
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Priority support
              </li>
            </ul>
            <a
              href="/signup"
              className="mt-auto text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
