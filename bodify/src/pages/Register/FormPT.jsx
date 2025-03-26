import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faMapMarkerAlt, faUserCircle, faLock, faEnvelope, faUpload } from '@fortawesome/free-solid-svg-icons';

const FormPT = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  // Khi người dùng chọn file
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Kích hoạt input file khi nhấn vào khu vực upload
  const handleUploadClick = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className='flex w-full items-stretch'>
      <div className="bg-white w-3/5 px-20 py-14">
        <h1 className="text-center text-orange-500 text-2xl font-bold mb-6">PT Registration Form</h1>
        <form>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-text mb-2">Full Name</label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="text" placeholder="Enter your full name" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-text mb-2">Phone</label>
            <div className="relative">
              <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="text" placeholder="Enter your phone number" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-text mb-2">Address</label>
            <div className="relative">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="text" placeholder="Enter your address" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-text mb-2">Username</label>
            <div className="relative">
              <FontAwesomeIcon icon={faUserCircle} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="text" placeholder="Create a username" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-text mb-2">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="password" placeholder="Enter a password" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Gym */}
          <div className="mb-4">
            <label className="block text-text mb-2">Gym</label>
            <div className="relative">
              <select className="w-full pl-14 px-3 py-2 border border-gray-300 rounded">
                <option></option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-text mb-2">Email</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input type="email" placeholder="Enter your email" className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-text mb-2">File CV</label>

            {/* Input file ẩn */}
            <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />

            {/* Khu vực nhấn để mở file */}
            <div
              className="border border-gray-300 rounded flex justify-center items-center h-32 flex-col cursor-pointer"
              onClick={handleUploadClick}
            >
              <FontAwesomeIcon icon={faUpload} className="text-orange-500 text-2xl" />
              <p className='text-text mt-2'>{selectedFile ? selectedFile.name : 'Click to upload'}</p>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded">Register</button>
          </div>
        </form>
      </div>

      <div className='bg-gray-400 w-2/5'></div>
    </div>
  );
};

export default FormPT;
