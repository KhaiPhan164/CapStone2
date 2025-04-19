import React, { useEffect, useState } from "react";
import Footer from "../../layout/Footer";
import Header from "../../layout/Header";
import { HomeBanner } from "./Banner";
import ExerciseService from '../../services/exercise.service';
import { Link } from "react-router-dom";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { Pagination } from "../../components/Table/Pagination";
import AuthService from '../../services/auth.service';

const BASE_URL = 'http://localhost:3000';

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
             exercise.exerciseposttag?.some(tag => tag.tag?.tag_name?.toLowerCase().includes(searchLower));
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
        // Hiện tại ExerciseService.getAll() không cần token nhưng để đề phòng API thay đổi
      }
      
      const response = await ExerciseService.getAll();
      console.log('API response:', response.data);
      
      // Kiểm tra cấu trúc response và lấy mảng exercises từ response.data
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
    return filteredExercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <div>
      <Header />
      <HomeBanner />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SectionTitle title="All Exercises" />
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentPageExercises().map((exercise) => (
                <Link
                  key={exercise.exercise_post_id}
                  to={`/exercise/${exercise.exercise_post_id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={exercise.imgUrl ? `${BASE_URL}/${exercise.imgUrl}` : '/placeholder-image.jpg'}
                      alt={exercise.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.exerciseposttag?.map((tagObj) => (
                          <span
                            key={tagObj.tag.tag_id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tagObj.tag.tag_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};
