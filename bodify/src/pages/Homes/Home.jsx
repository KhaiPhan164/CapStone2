import React from "react";
import Chatbox from "../../components/Chatbox/Chatbox";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container-auto font-sans">
      {/* --------home---------- */}
      <div className="bg-gradient h-auto md:h-[500px] container-auto rounded-lg p-4 md:p-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mx-1 lg:relative mb-10 md:mb-20">
        <div className="text-center md:text-left w-full md:w-[600px] md:ml-10">
          <p className="text-2xl sm:text-3xl md:text-[80px] md:leading-[70px] font-bold text-black mb-2 md:mb-4">
            Transform Your Fitness Journey from Anywhere
          </p>
          <p className="text-black mb-4 md:mb-6 max-w-full w-full md:w-[550px] text-base md:text-lg">
            Work out effectively anytime, anywhere with personalized programs
            for all fitness levels. Start your healthy journey today!
          </p>
          <div className="flex flex-col md:flex-row gap-2 md:space-x-4">
            <Link to="/exercise">
              <button className="bg-black text-white px-6 py-2 rounded-full w-full md:w-auto">
                Get Started Now
              </button>
            </Link>
            <Link to="/gyms">
              <button className="border-2 border-black text-black px-6 py-2 rounded-full w-full md:w-auto">
                Explore Classes
              </button>
            </Link>
          </div>
        </div>
        <img
          src="./images/gym-nu.jpg"
          alt="Female fitness model"
          className="w-full max-w-xs sm:max-w-sm md:w-[400px] h-60 sm:h-80 md:h-[500px] rounded-lg lg:absolute md:right-20 md:-bottom-10 object-cover object-[50%_20%]"
        />
      </div>

      {/* Add Chatbox */}
      <Chatbox />
    </div>
  );
};

export default Home;
