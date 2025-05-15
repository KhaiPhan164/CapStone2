import React from 'react'

const FitnessNow = () => {
  return (
    <div>
    <div className="container-auto px-4 flex flex-col md:flex-row items-start justify-center gap-10 md:h-[490px]">
    <div className="w-full md:w-[500px] md:h-[400px] bg-gray-400 overflow-hidden rounded-lg">
      <img src="./images/fitness.jpg" alt="Fitness training" className="w-full h-full object-cover " />
    </div>

    <div className="w-full md:w-[540px] mt-8 md:mt-0 md:ml-8 flex items-start flex-col">
        <h2 className="text-gray-500 text-xl font-medium mt-4">
        Fitness Now
        </h2>
        <h1 className="text-black text-[70px] leading-[60px] font-bold mt-2 mb-2">
        Training Anytime, Anywhere
        </h1>
        <p className="text-gray-700 text-base mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna.
        </p>
        <p className="text-gray-700 text-base mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh
        </p>
        <button className="mt-6 bg-orange-500 text-white py-2 px-4 rounded-full">
        Join Us Online
        </button>
    </div>
    </div>
    </div>
  )
}

export default FitnessNow