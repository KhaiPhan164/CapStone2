import React from 'react'
import { Link } from 'react-router-dom'

const Classes = () => {
  return (
    <div>
              {/* --------------className---------------- */}
      <div className="flex flex-col md:flex-row items-center h-[600px] container-auto">
            <div className="md:w-1/3 text-center md:text-left md:mb-0 md:ml-20">
                <p className="text-gray-500 text-xl font-medium">Top Picks</p>
                <p className="text-[70px] leading-[60px] font-bold my-5">Featured Personal Trainer</p>
                <p className="text-gray-600 mt-2">Choose from our most popular classes crafted for fitness level</p>
                <Link to="/pt-list">
                  <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">View All PT</button>
                </Link>
            </div>
            <div className="md:w-2/3 w-full mt-10 flex justify-center  space-x-6 overflow-hidden">
                <div className="w-56 h-[350px] bg-gray-300 flex items-end justify-start my-10 relative overflow-hidden rounded-lg">
                    <img src="./images/strength.jpg" alt="Strength training" className="absolute top-0 left-0 w-full h-full object-cover" />
                    <p className="text-white mb-2 ml-2 relative z-10 px-2 py-1 rounded">Strength</p>
                </div>
                <div className="w-56 h-[350px] bg-gray-300 flex items-end justify-start relative overflow-hidden rounded-lg">
                  <img src="./images/burn.JPG" alt="Fat burning workout" className="absolute top-0 left-0 w-full h-full object-cover" />
                    <p className="text-white mb-2 ml-2 relative z-10 px-2 py-1 rounded">Burn</p>
                </div>
                <div className="w-56 h-[350px] bg-gray-300 flex items-end justify-start my-10 relative overflow-hidden rounded-lg">
                    <img src="./images/yoga.JPG" alt="Yoga practice" className="absolute top-0 left-0 w-full h-full object-cover" />
                    <p className="text-white mb-2 ml-2 relative z-10 px-2 py-1 rounded">Yoga</p>
                </div>
            </div>
            </div>
    </div>
  )
}

export default Classes