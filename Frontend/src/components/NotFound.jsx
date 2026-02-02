import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
      <div className="text-center">
        <div className="glass-card inline-block p-8 mb-8">
          <span className="text-9xl">🔍</span>
        </div>
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
        <Link
          to="/dashboard"
          className="btn-glass-primary inline-flex items-center space-x-2"
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
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
