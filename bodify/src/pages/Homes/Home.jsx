import React from 'react'
import Chatbox from '../../components/Chatbox/Chatbox'

const Home = () => {
  return (
    <div className='container-auto font-sans'>
      {/* --------home---------- */}
    <div className="bg-gradient h-[500px] container-auto rounded-lg p-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mx-1 lg:relative mb-20">
      <div className="text-center md:text-left w-full md:w-[600px] md:ml-10">
        <p className="text-3xl md:text-[80px] md:leading-[70px] font-bold text-black mb-4">
        Transform Your Fitness Journey from Anywhere
        </p>
        <p className="text-black mb-6 max-w-full w-[550px]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut
        </p>
        <div className="flex space-x-4">
        <button className="bg-black text-white px-6 py-2 rounded-full">
          Get Started Now
        </button>
        <button className="border-2 border-black text-black px-6 py-2 rounded-full">
          Explore Classes
        </button>
        </div>
      </div>
      <img src="./images/gym-nu.jpg" 
  alt="Mô tả ảnh" 
  className="w-full md:w-[400px] h-[500px] rounded-lg lg:absolute md:right-20 md:-bottom-10 object-cover object-[50%_20%]" />


      </div>

      {/* Add Chatbox */}
      <Chatbox />
    </div>
  )
}

export default Home