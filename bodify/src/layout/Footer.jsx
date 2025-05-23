const Footer = () => {
  return (
    <div className='pt-10 px-4 md:px-20 lg:px-32 bg-gray-900 w-full overflow-hidden' id='Footer'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-start'>
            <div className="w-[500px] mr-20">
                <img src="./icon/logo_trang.svg" alt="" className="w-20 h-10"/> 
                <p className='text-gray-400 mt-1'>We’re redefining fitness with real results, expert support, and flexible training that fits your life. No fluff—just what works.</p>
            </div>

        <div className='w-full md:w-1/5 mb-8 md:mb-0'>
            <h3 className='text-white text-lg font-bold mb-4'>
                Company
            </h3>
            <ul className='flex flex-col gap-2 text-gray-400'>
                <a href="#Header" className='hover:text-white'>Home</a>
                <a href="#About" className='hover:text-white'>Exercise</a>
                <a href="#Contact" className='hover:text-white'>Gyms</a>
                <a href="" className='hover:text-white'>PT List</a>
            </ul>
        </div>
        <div className='w-full md:w-1/3'>
            {/* <h3 className='text-white text-lg font-bold mb-4'>Subscribe to our newsletter</h3>
            <p className='text-gray-400 mb-4 max-w-80'>The latest news, articles, and resources, sent to your inbox weekly</p>
            <div className='flex gap-2'>
                <input type="email" placeholder='Enter your email' className='p-2 rounded bg-gray-800 text-gray-400 border border-gray-700 focus:outline-none w-full md:w-auto' name="" id="" />
                <button className='py-2 px-4 rounded bg-blue-500 text-white'>Subcribe</button>
            </div> */}
            <p className="text-white text-lg font-bold ">Contact</p>
            <p className="text-white text-lg font-bold mb-4">FAQ</p>
        </div>
        </div>
        <div className='border-t border-gray-700 py-4 mt-10 text-center text-gray-500'>
        </div>
    </div>
  )
}

export default Footer