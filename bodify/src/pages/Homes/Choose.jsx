import React from 'react'

const Choose = () => {
  return (
    <div>
        <div className="container-auto px-4 -mt-10 flex flex-col items-center justify-center md:h-[460px]">
        <h1 className="text-2xl md:text-[70px] leading-[60px] font-bold md:mb-10">Why Choose Us?</h1>
        <p className="text-gray-600 mb-8 sm:w-[400px] text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut</p>
        <div className="flex flex-wrap justify-center gap-4">
            <div className="border-2 border-gray-400 w-44 rounded-xl py-8 px-10 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Flexibility</p>
                <div className="h-[1px] bg-secondary w-12 mx-auto"></div>
            </div>
            <div className="border-2 border-gray-400 w-44 rounded-xl py-8 px-10 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Wellness</p>
                <div className="h-[1px] bg-secondary w-12 mx-auto"></div>
            </div>
            <div className="border-2 border-gray-400 w-44 rounded-xl py-8 px-10 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Community</p>
                <div className="h-[1px] bg-secondary w-12 mx-auto"></div>
            </div>
            <div className="border-2 border-gray-400 w-44 rounded-xl py-8 px-10 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">Results</p>
                <div className="h-[1px] bg-secondary w-12 mx-auto"></div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default Choose