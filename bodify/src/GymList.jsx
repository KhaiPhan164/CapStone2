import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Pagination } from './components/Table/Pagination';
import { SectionTitle } from './components/Title/SectionTitle';

const GymList = () => {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/gym');
        if (response.data && Array.isArray(response.data)) {
          setGyms(response.data);
          setFilteredGyms(response.data);
          setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
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
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, gyms]);

  const handleViewDetails = (gymId) => {
    navigate(`/users/public/${gymId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPageGyms = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredGyms.slice(startIndex, endIndex);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col">
          {/* Banner section */}
          <div className="mt-14 flex flex-col gap-y-6 items-center justify-start px-4 md:px-0">
            <div className="flex flex-col items-center gap-y-4 text-center">
              <h1 className="flex text-[#00000096] text-4xl md:text-6xl space-x-3 items-center font-medium">
                <p>Gym List</p>
              </h1>
            </div>
            {/* Search box */}
            <div className="">
              <div className="flex items-center max-w-[300px] sm:max-w-xl mx-auto rounded-full border border-gray-400 overflow-hidden shadow-sm">
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng gym..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-xs w-[300px] sm:text-base py-0 sm:py-2 pl-6 md:pl-8 text-gray-600 italic outline-none"
                />
                <button className="bg-gradient-to-r from-[#ffd26a] to-primary-500 p-3 rounded-full text-white px-8 sm:px-11 py-2 sm:py-2.5 text-base sm:text-xl">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
          </div>

          {/* Gym list section */}
          <div className="container mx-auto px-4 xl:max-w-[1067px] flex flex-col gap-5 pb-5 mt-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 w-full items-center overflow-hidden">
                <div className="min-w-fit">
                  <SectionTitle title="Gym List" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : filteredGyms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 italic">Không tìm thấy phòng gym nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPageGyms().map((gym) => (
                  <div key={gym.user_id} className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4">
                    <div className="w-full h-72 mb-4 bg-gray-200 flex items-center justify-center">
                      {gym.imgUrl ? (
                        <img 
                          src={gym.imgUrl} 
                          alt={gym.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-4xl">GYM</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-bold text-gray-800">{gym.name}</h2>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        {gym.email}
                      </div>
                      {gym.phoneNum && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <FontAwesomeIcon icon={faPhone} className="mr-2" />
                          {gym.phoneNum}
                        </div>
                      )}
                      {gym.address && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                          {gym.address}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-2">
                        {gym.introduction || 'Chưa có mô tả'}
                      </p>
                      <button 
                        onClick={() => handleViewDetails(gym.user_id)}
                        className="w-full bg-gradient-to-r from-[#ffd26a] to-primary-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredGyms.length > 0 && (
              <div className="mt-8">
                <Pagination totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymList; 