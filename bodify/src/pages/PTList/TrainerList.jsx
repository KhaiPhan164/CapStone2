import React, { useState, useEffect } from "react";
import Header from "../../layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pagination } from "../../components/Table/Pagination";

const ITEMS_PER_PAGE = 6;

export default function TrainerList() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/users/pt', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data)) {
          setTrainers(response.data);
          setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
        } else {
          setError('Dữ liệu không đúng định dạng');
        }
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải danh sách PT:', err);
        if (err.response?.status === 401) {
          setError('Vui lòng đăng nhập để xem danh sách PT');
          navigate('/sign-in');
        } else {
          setError('Không thể tải danh sách PT. Vui lòng thử lại sau.');
        }
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [navigate]);

  useEffect(() => {
    const filtered = trainers.filter(trainer =>
      trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.phoneNum?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, trainers]);

  const handleViewDetails = (ptId) => {
    navigate(`/users/public/${ptId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter trainers based on search term
  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.phoneNum?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTrainers = filteredTrainers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 xl:max-w-[1067px] py-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 xl:max-w-[1067px] py-8">
          <div className="text-red-500 text-center py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col">
        {/* Banner section */}
        <div className="mt-14 flex flex-col gap-y-6 items-center justify-start px-4 md:px-0">
          <div className="flex flex-col items-center gap-y-4 text-center">
            <h1 className="flex text-[#00000096] text-4xl md:text-6xl space-x-3 items-center font-medium">
              <p>Danh sách Huấn Luyện Viên</p>
            </h1>
          </div>
          {/* Search box */}
          <div className="">
            <div className="flex items-center max-w-[300px] sm:max-w-xl mx-auto rounded-full border border-gray-400 overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Tìm kiếm huấn luyện viên..."
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

        {/* Trainer list section */}
        <div className="container mx-auto px-4 xl:max-w-[1067px] flex flex-col gap-5 pb-5 mt-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 w-full items-center overflow-hidden">
              <div className="min-w-fit">
                <h2 className="text-2xl font-bold">Danh sách PT</h2>
              </div>
            </div>
          </div>

          {/* Trainer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {paginatedTrainers.map((trainer) => (
              <div
                key={trainer.user_id}
                className="p-4 flex flex-col items-center text-center bg-[#f5f5f5] border border-transparent hover:border-primary-500 hover:bg-[#fff3d8] rounded-[5px] shadow-lg transition-all duration-300"
              >
                <div className="w-full h-72 mb-4 bg-gray-200 flex items-center justify-center">
                  {trainer.imgUrl ? (
                    <img 
                      src={trainer.imgUrl} 
                      alt={trainer.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-4xl">PT</span>
                  )}
                </div>
                <div className="flex flex-col w-full text-left gap-2">
                  <h2 className="text-xl font-semibold">{trainer.name}</h2>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    {trainer.email || 'Chưa cập nhật email'}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    {trainer.phoneNum || 'Chưa cập nhật SĐT'}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 w-full">
                  <button 
                    onClick={() => handleViewDetails(trainer.user_id)}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white hover:bg-[#ffbc74] transition font-semibold rounded"
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    className="flex-1 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 transition font-semibold rounded"
                    disabled
                  >
                    Liên hệ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredTrainers.length > 0 && (
            <div className="mt-8">
              <Pagination totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

