import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const GymList = () => {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/gym');
        if (response.data && Array.isArray(response.data)) {
          setGyms(response.data);
          setFilteredGyms(response.data);
        } else {
          setError('Dữ liệu không đúng định dạng');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải danh sách gym:', err);
        setError('Không thể tải danh sách phòng gym. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  useEffect(() => {
    const filtered = gyms.filter(gym => 
      gym.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.introduction?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGyms(filtered);
  }, [searchTerm, gyms]);

  const handleViewDetails = (gymId) => {
    navigate(`/users/public/${gymId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-lg">Đang tải danh sách phòng gym...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-red-500">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Danh sách Phòng Gym</h1>
      
      {/* Thanh tìm kiếm */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm phòng gym..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {filteredGyms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Không tìm thấy phòng gym nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map((gym) => (
            <div key={gym.user_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {gym.imgUrl ? (
                    <img 
                      src={gym.imgUrl} 
                      alt={gym.name} 
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="text-gray-500 text-xl">GYM</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{gym.name}</h2>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      {gym.email}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{gym.introduction || 'Chưa có mô tả'}</p>
                <div className="space-y-2 mb-4">
                  {gym.phoneNum && (
                    <div className="flex items-center text-gray-600">
                      <FontAwesomeIcon icon={faPhone} className="mr-2" />
                      {gym.phoneNum}
                    </div>
                  )}
                  {gym.address && (
                    <div className="flex items-center text-gray-600">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      {gym.address}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleViewDetails(gym.user_id)}
                  className="w-full bg-primary-500 text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymList; 