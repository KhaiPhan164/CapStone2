import React from 'react'
import { SectionTitle } from '../../components/Title/SectionTitle'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Header from '../../layout/Header';

const UserInformation = () => {
  return (
    <div>
    <Header/>
    <div className='flex h-screen container-auto bg-gray-100'>
        <div className="w-1/4 bg-white p-4 rounded-xl my-5 ">
            <ul className="space-y-4">
                <li 
                className="cursor-pointer block p-2 text-gray-600 bg-primary-500 rounded-xl border border-red-500' : 'hover:bg-red-100 hover:text-red-500"
                >
                <div className="flex items-center font-bold text-white">
                    <img
                    src="./images/user.png" 
                    alt="Home Icon"
                    className="mr-3 ml-2 w-6 h6 filter invert" 
                    />
                    My Profile
                </div>
                </li>
            </ul>
        </div>
        {/* <!-- Main Content --> */}
        <div className="w-3/4 p-6">
            <h1 className="text-2xl font-semibold mb-6 text-gray-700">
            My Profile
            </h1>
            <div className="bg-white  p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-start justify-between">
                <div className="flex items-start">
                <img alt="Profile picture of Jack Adams" className="w-16 h-16 rounded-full mr-2" height="100" src="https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg" width="100"/>
                <div>
                    <h2 className="text-xl font-semibold text-primary-500">
                    Jack Adams
                    </h2>
                    <p className='text-text'>
                        xin chao moi nguoi
                    </p>
                </div>
                </div>
                <button className="text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300">
                <FontAwesomeIcon icon={faEdit} className="w-3 h-3" /> {/* Icon */}
                Edit
                </button>

                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <SectionTitle title="Personal information" />
                    <button className="text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300">
                    <FontAwesomeIcon icon={faEdit} className="w-3 h-3" /> {/* Icon */}
                    Edit
                    </button>

                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-gray-700">
                        Username
                    </label>
                    <p className="font-semibold text-text">
                        Ja**
                    </p>
                    </div>
                    <div>
                    <label className="block text-gray-700">
                        Password
                    </label>
                    <p className="font-semibold text-text">
                        ****
                    </p>
                    </div>
                    <div>
                    <label className="block text-gray-700">
                        Email address
                    </label>
                    <p className="font-semibold text-text">
                        jackadams@gmail.com
                    </p>
                    </div>
                    <div>
                    <label className="block text-gray-700">
                        Phone
                    </label>
                    <p className="font-semibold text-text">
                        (213) 555-1234
                    </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default UserInformation