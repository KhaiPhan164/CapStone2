import React from 'react'

const MeetPT = () => {
  return (
    <div>
    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 p-6 container-auto md:h-[460px]">
        <div className="text-center md:text-left md:w-[550px]">
            <p className="text-gray-500 text-xl font-medium">
            Mia Sparks
            </p>
            <h1 className="text-[70px] leading-[60px] font-bold my-5">
            Meet Your Coach
            </h1>
            <p className="mt-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
            </p>
            <p className="mt-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh.
            </p>
        </div>
        <div className="relative">
            <img alt="Portrait of a smiling woman with a yellow background" className="rounded-full w-[300px] h-[300px] z-30" height="150" src="https://storage.googleapis.com/a1aa/image/nwxC0JY2Acc31s8_KndwOSNK4Al_pS9rLY2aKca1jEM.jpg" width="150"/>
            <div className="absolute -bottom-5 -right-[30px] w-[250px] h-[250px] bg-orange-400 -z-10 rounded-full">
            </div>
            <div className="absolute top-5 -right-10 w-32 h-32 -z-10 bg-orange-500 rounded-full">
            </div>
        </div>
        </div>
    </div>
  )
}

export default MeetPT