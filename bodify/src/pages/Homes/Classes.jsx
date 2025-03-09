import React from 'react'

const Classes = () => {
  return (
    <div>
              {/* --------------class---------------- */}
      <div class="flex flex-col md:flex-row items-center h-[600px] container-auto">
            <div class="md:w-1/3 text-center md:text-left md:mb-0 md:ml-20">
                <p class="text-gray-500 text-xl font-medium">Top Picks</p>
                <p class="text-[70px] leading-[60px] font-bold my-5">Featured Workouts</p>
                <p class="text-gray-600 mt-2">Choose from our most popular classes crafted for fitness level</p>
                <button class="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">View All Classes</button>
            </div>
            <div class="md:w-2/3 w-full mt-10 flex justify-center  space-x-6 overflow-hidden">
                <div class="w-56 h-[350px] bg-gray-300 flex items-end justify-center my-10">
                    <p class="text-white mb-2">Strength</p>
                </div>
                <div class="w-56 h-[350px] bg-gray-300 flex items-end justify-center">
                    <p class="text-white mb-2">Burn</p>
                </div>
                <div class="w-56 h-[350px] bg-gray-300 flex items-end justify-center my-10">
                    <p class="text-white mb-2">Yoga</p>
                </div>
            </div>
            </div>
    </div>
  )
}

export default Classes