import React from "react";

const MeetPT = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6 p-4 md:p-6 mt-5 container-auto md:h-[460px]">
        <div className="text-center md:text-left w-full md:w-[550px]">
          <p className="text-gray-500 text-lg md:text-xl font-medium">
            Mia Sparks
          </p>
          <h1 className="text-3xl md:text-[70px] leading-tight md:leading-[60px] font-bold my-3 md:my-5">
            Meet Your Coach
          </h1>
          <p className="mt-2 md:mt-4 text-gray-700 text-base md:text-lg">
            Get guidance from certified fitness experts who are passionate about
            helping you succeed. With personalized support, expert advice, and
            motivation every step of the way, you'll be empowered to reach your
            goals faster and smarter.
          </p>
          <p className="mt-2 md:mt-4 text-gray-700 text-base md:text-lg">
            Your journey is unique—your coach makes sure it stays that way.
          </p>
        </div>
        <div className="relative mt-4 md:mt-0">
          <img
            alt="Portrait of a smiling woman with a yellow background"
            className="rounded-full w-40 h-40 md:w-[300px] md:h-[300px] z-30"
            height="150"
            src="images/avata.png"
            width="150"
          />
          <div className="absolute -bottom-3 md:-bottom-5 -right-4 md:-right-[30px] w-32 md:w-[250px] h-32 md:h-[250px] bg-orange-400 -z-10 rounded-full"></div>
          <div className="absolute top-2 md:top-5 -right-6 md:-right-10 w-16 md:w-32 h-16 md:h-32 -z-10 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MeetPT;
