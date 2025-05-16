import React from "react";

const MeetPT = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 p-6 container-auto md:h-[460px]">
        <div className="text-center md:text-left md:w-[550px]">
          <p className="text-gray-500 text-xl font-medium">Mia Sparks</p>
          <h1 className="text-[70px] leading-[60px] font-bold my-5">
            Meet Your Coach
          </h1>
          <p className="mt-4 text-gray-700">
            Get guidance from certified fitness experts who are passionate about
            helping you succeed. With personalized support, expert advice, and
            motivation every step of the way, you'll be empowered to reach your
            goals faster and smarter.
          </p>
          <p className="mt-4 text-gray-700">
            Your journey is unique—your coach makes sure it stays that way.
          </p>
        </div>
        <div className="relative">
          <img
            alt="Portrait of a smiling woman with a yellow background"
            className="rounded-full w-[300px] h-[300px] z-30"
            height="150"
            src="images/avata.png"
            width="150"
          />
          <div className="absolute -bottom-5 -right-[30px] w-[250px] h-[250px] bg-orange-400 -z-10 rounded-full"></div>
          <div className="absolute top-5 -right-10 w-32 h-32 -z-10 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MeetPT;
