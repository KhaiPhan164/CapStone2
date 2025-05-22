import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faLock, faUpload } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../../services/auth.service';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create a new axios instance without redirect interceptor
const publicAxios = axios.create({
  baseURL: 'http://localhost:3000'
});

const FormPT = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    gym: ''
  });
  const [certificates, setCertificates] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      // Use publicAxios instead of axios
      const response = await publicAxios.get('/users/gym');
      setGyms(response.data);
    } catch (err) {
      setError('Unable to load gym list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setCertificates(files);
  };

  const handleUploadClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.username || !formData.password || !formData.gym || certificates.length === 0) {
        throw new Error('Please fill in all required information');
      }

      // Call API to register PT
      const response = await AuthService.registerPT(formData, certificates);
      
      // AuthService.registerPT already handles localStorage updates
      if (response && response.data) {
        alert('PT registration successful!');
        navigate('/');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex w-full items-stretch'>
      <div className="bg-white w-3/5 px-20 py-14">
        <h1 className="text-center text-orange-500 text-2xl font-bold mb-6">Register as PT</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label className="block text-text mb-2">Username</label>
            <div className="relative">
              <FontAwesomeIcon icon={faUserCircle} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Create username" 
                className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" 
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-text mb-2">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password" 
                className="w-full pl-14 px-3 py-2 border border-gray-300 rounded" 
                required
              />
            </div>
          </div>

          {/* Gym */}
          <div className="mb-4">
            <label className="block text-text mb-2">Gym</label>
            <div className="relative">
              <select 
                name="gym"
                value={formData.gym}
                onChange={handleInputChange}
                className="w-full pl-14 px-3 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select gym</option>
                {gyms.map((gym) => (
                  <option key={gym.id} value={gym.name}>
                    {gym.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-text mb-2">Certificates</label>
            <input 
              type="file" 
              id="fileInput" 
              className="hidden" 
              onChange={handleFileChange}
              multiple
              accept="image/*"
              required
            />
            <div
              className="border border-gray-300 rounded flex justify-center items-center h-32 flex-col cursor-pointer"
              onClick={handleUploadClick}
            >
              <FontAwesomeIcon icon={faUpload} className="text-orange-500 text-2xl" />
              <p className='text-text mt-2'>
                {certificates.length > 0 
                  ? `Selected ${certificates.length} files` 
                  : 'Click to upload certificates'}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button 
              type="submit" 
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>

      <div className='bg-gray-400 w-2/5'>
        <img src="/images/dkpt.jpg" alt="Description" className="w-full h-full object-right" />
      </div>
    </div>
  );
};

export default FormPT;