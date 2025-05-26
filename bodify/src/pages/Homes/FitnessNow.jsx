import React from "react";

const FitnessNow = () => {
  return (
    <div>
      <div className="container-auto px-2 sm:px-4 flex flex-col md:flex-row items-start justify-center gap-6 md:gap-10 md:h-[490px]">
        <div className="hidden md:block w-full md:w-[500px] h-48 md:h-[400px] bg-gray-400 overflow-hidden rounded-lg">
          <img
            src="./images/fitness.jpg"
            alt="Fitness training"
            className="w-full h-full object-cover "
          />
        </div>
        <div className="w-full md:w-[540px] mt-6 md:mt-0 md:ml-8 flex md:items-start items-center flex-col">
          <h2 className="text-gray-500 text-lg md:text-xl font-medium mt-2 md:mt-4">
            Fitness Now
          </h2>
          <div className="md:hidden w-full md:w-[500px] h-48 md:h-[400px] bg-gray-400 overflow-hidden rounded-lg">
          <img
            src="./images/fitness.jpg"
            alt="Fitness training"
            className="w-full h-full object-cover "
          />
        </div>
          <h1 className="text-black text-3xl md:text-[68px] leading-tight md:leading-[60px] font-bold mt-2 mb-2 text-center md:text-left">
            Training Anytime, Anywhere
          </h1>
          <p className="text-gray-700 text-base mt-2 md:mt-4 text-center md:text-left">
            Achieve your goals with flexible, on-demand workouts designed to fit
            your lifestyle. Join us to stay active, strong, and motivated—no
            matter where you are.
          </p>
          <p className="text-gray-700 text-base mt-2 md:mt-4 text-center md:text-left">
            Stay consistent, stay confident—your fitness journey starts here.
          </p>
          <button className="mt-4 md:mt-6 bg-orange-500 text-white py-2 px-4 rounded-full">
            Join Us Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default FitnessNow;
