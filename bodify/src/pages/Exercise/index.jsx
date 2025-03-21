import React, { useEffect, useState } from "react";
import Footer from "../../layout/Footer";
import Header from "../../layout/Header";
import { HomeBanner } from "./Banner";
import ExerciseService from '../../services/exercise.service';
import { Link } from "react-router-dom";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { Pagination } from "../../components/Table/Pagination";
import AuthService from '../../services/auth.service';

export const ExerciseHome = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (!Array.isArray(exercises)) {
      console.error('exercises is not an array:', exercises);
      setFilteredExercises([]);
      setTotalPages(1);
      return;
    }
    
    const filtered = exercises.filter(exercise => {
      const searchLower = searchTerm.toLowerCase();
      return exercise.name?.toLowerCase().includes(searchLower) ||
             exercise.description?.toLowerCase().includes(searchLower) ||
             exercise.tags?.some(tag => tag.tag?.tagName?.toLowerCase().includes(searchLower));
    });
    setFilteredExercises(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [exercises, searchTerm]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      const authHeader = AuthService.getAuthHeader();
      if (authHeader.Authorization) {
        // Thiết lập headers cho ExerciseService nếu cần
        // Hiện tại ExerciseService.getAllExercises() không cần token nhưng để đề phòng API thay đổi
      }
      
      const response = await ExerciseService.getAllExercises();
      console.log('API response:', response.data);
      
      // Kiểm tra cấu trúc response và lấy mảng exercises từ response.data.data
      if (response.data && Array.isArray(response.data.data)) {
        // Trường hợp response có dạng {message: '...', data: Array(...)}
        const exercisesData = response.data.data;
        setExercises(exercisesData);
        setFilteredExercises(exercisesData);
        setTotalPages(Math.ceil(exercisesData.length / ITEMS_PER_PAGE));
      } else if (Array.isArray(response.data)) {
        // Trường hợp response.data đã là một mảng
        const exercisesData = response.data;
        setExercises(exercisesData);
        setFilteredExercises(exercisesData);
        setTotalPages(Math.ceil(exercisesData.length / ITEMS_PER_PAGE));
      } else {
        console.error('API response does not contain an array:', response.data);
        setExercises([]);
        setFilteredExercises([]);
        setTotalPages(1);
        setError('Dữ liệu bài tập không đúng định dạng');
      }
    } catch (error) {
      setError('Không thể tải danh sách bài tập');
      console.error('Error fetching exercises:', error);
      setExercises([]);
      setFilteredExercises([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const getCurrentPageExercises = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredExercises.slice(startIndex, endIndex);
  };

  return (
    <div>
      <Header/>
      <div className="flex flex-col">
        <HomeBanner onSearch={handleSearch} />
        
        {/* Danh sách bài tập */}
        <div className="container mx-auto px-4 xl:max-w-[1067px] flex flex-col gap-5 pb-5 mt-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 w-full items-center overflow-hidden">
              <div className="min-w-fit">
                <SectionTitle title="Exercise" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentPageExercises().map((exercise) => (
                <div key={exercise.id} className="bg-white shadow-md overflow-hidden">
                  <Link to={`/exercise-posts/${exercise.id}`}>
                    <img 
                      src={exercise.imgUrl || "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg"} 
                      alt={exercise.name || 'Exercise image'} 
                      className="w-full h-[200px] object-cover" 
                      onError={(e) => {
                        e.target.src = "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg";
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/exercise-posts/${exercise.id}`}>
                      <h2 className="text-lg font-bold mb-2 text-gray-800 leading-tight">
                        {exercise.name}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(exercise.tags) && exercise.tags.map((tagObj, index) => (
                        <span 
                          key={tagObj.tagId || index} 
                          className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1"
                        >
                          {tagObj.tag?.tagName || 'Unknown Tag'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">Không tìm thấy bài tập nào</div>
          )}
          {filteredExercises.length > 0 && (
            <Pagination totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
};
