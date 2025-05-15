import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-10 bg-gray-50">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            The page you are looking for may have been removed, renamed, or is temporarily unavailable.
          </p>
          <Link to="/">
            <button className="px-8 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </button>
          </Link>
        </div>
        
        <div className="w-full md:w-1/2 mt-10 md:mt-0 relative">
          <div className="relative z-10">
            <img 
              src="/images/404-gym.jpg" 
              alt="Gym equipment" 
              className="rounded-lg shadow-xl max-w-full md:max-w-lg mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltJTIwZXF1aXBtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";
              }}
            />
          </div>
          <div className="absolute top-5 right-5 w-40 h-40 bg-orange-400 rounded-full opacity-20 -z-10"></div>
          <div className="absolute bottom-5 left-5 w-20 h-20 bg-primary-500 rounded-full opacity-20 -z-10"></div>
        </div>
      </div>
      
      <div className="bg-gray-100 py-8 px-4 text-center">
        <h3 className="text-xl font-semibold mb-4">Explore Our Exercise Collection</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/exercise">
            <button className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-black transition-colors">
              Exercise List
            </button>
          </Link>
          <Link to="/gyms">
            <button className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
              Find Gyms
            </button>
          </Link>
          <Link to="/pt-list">
            <button className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">
              Trainers
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 