import React, { useEffect, useState } from "react";
import Footer from "../../layout/Footer";
import Header from "../../layout/Header";
import { HomeBanner } from "./Banner";
import ExerciseService from '../../services/exercise.service';
import { Link } from "react-router-dom";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { Pagination } from "../../components/Table/Pagination";
import AuthService from '../../services/auth.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import RecommendService from '../../services/recommend';

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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [recommendError, setRecommendError] = useState(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'recommended', label: 'Recommend', icon: faStar }
  ];

  useEffect(() => {
    if (selectedFilter === 'recommended') {
      fetchRecommendedExercises();
    } else {
      fetchExercises();
    }
  }, [selectedFilter]);

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

  const fetchRecommendedExercises = async () => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      setRecommendError('Please login to see personalized recommendations');
      setFilteredExercises([]);
      return;
    }

    try {
      setLoading(true);
      // 1. Get health analysis to get tags
      const healthAnalysis = await RecommendService.getHealthAnalysis(user.user_id);
      console.log('Raw health analysis response:', healthAnalysis);
      
      if (healthAnalysis.status === 'success' && healthAnalysis.data.analysis) {
        const { 
          workout_tags = [], 
          health_info_tags = [], 
          illness_tags = [], 
          exclude_tags = [] 
        } = healthAnalysis.data.analysis;
        
        console.log('Health Analysis Response:', {
          workout_tags,
          health_info_tags,
          illness_tags,
          exclude_tags
        });
        
        if (!workout_tags.length && !health_info_tags.length && !illness_tags.length) {
          setRecommendError('Please update your health information to get personalized recommendations');
          setFilteredExercises([]);
          return;
        }

        // 2. Get exercises based on tags
        const allTags = [...workout_tags];
        console.log('Combined tags for search:', allTags);
        console.log('Exclude tags:', exclude_tags);
        console.log('Will call URL:', `${BASE_URL}/exercise-post/search/bytags?includeTags=${allTags.join(',')}&excludeTags=${exclude_tags.join(',')}`);
        
        if (allTags.length === 0) {
          setRecommendError('No matching exercise tags found');
          setFilteredExercises([]);
          return;
        }

        // Use searchByTagNames directly with tag names and exclude tags
        const exercisesResponse = await ExerciseService.searchByTagNames(allTags, exclude_tags);
        console.log('Exercise search response:', exercisesResponse);
        
        if (exercisesResponse && exercisesResponse.length > 0) {
          // Add matching tags to each exercise for display
          const exercisesWithTags = exercisesResponse.map(exercise => ({
            ...exercise,
            matching_tags: exercise.exerciseposttag
              .filter(tagObj => allTags.includes(tagObj.tag.tag_name))
              .map(tagObj => tagObj.tag.tag_name)
          }));
          
          setFilteredExercises(exercisesWithTags);
          setRecommendError(null);
        } else {
          setRecommendError('No exercises found matching your health profile');
          setFilteredExercises([]);
        }
      } else {
        setRecommendError('Could not analyze your health profile');
        setFilteredExercises([]);
      }
    } catch (error) {
      console.error('Recommend error:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setRecommendError('Error getting recommendations');
      setFilteredExercises([]);
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
        
        {/* Filter Buttons */}
        <div className="container mx-auto px-4 xl:max-w-[1067px] mt-5">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-2 rounded-full flex items-center gap-2 ${
                  selectedFilter === filter.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter.icon && <FontAwesomeIcon icon={filter.icon} />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message for Recommendations */}
        {recommendError && selectedFilter === 'recommended' && (
          <div className="container mx-auto px-4 xl:max-w-[1067px]">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              <span className="block sm:inline">{recommendError}</span>
              {(!AuthService.getCurrentUser() && recommendError.includes('login')) && (
                <Link to="/login" className="ml-4 underline hover:text-red-800">
                  Login now
                </Link>
              )}
              {(AuthService.getCurrentUser() && recommendError.includes('health information')) && (
                <Link to="/profile" className="ml-4 underline hover:text-red-800">
                  Update profile
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Danh sách bài tập */}
        <div className="container mx-auto px-4 xl:max-w-[1067px] flex flex-col gap-5 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 w-full items-center overflow-hidden">
              <div className="min-w-fit">
                <SectionTitle title={selectedFilter === 'recommended' ? 'Recommended Exercises' : 'All Exercises'} />
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
                <div key={exercise.exercisepost_id} className="bg-white shadow-md overflow-hidden">
                  <Link to={`/exercise-post/${exercise.exercisepost_id}`}>
                    <img 
                      src={exercise.img_url || "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg"} 
                      alt={exercise.name || 'Exercise image'} 
                      className="w-full h-[200px] object-cover" 
                      onError={(e) => {
                        e.target.src = "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg";
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/exercise-post/${exercise.exercisepost_id}`}>
                      <h2 className="text-lg font-bold mb-2 text-gray-800 leading-tight">
                        {exercise.name}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                    {selectedFilter === 'recommended' && exercise.matching_score && (
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-primary-600">
                          Matching Score: {exercise.matching_score}%
                        </div>
                        {exercise.matching_tags && exercise.matching_tags.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Matches your: {exercise.matching_tags.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(exercise.exerciseposttag) && exercise.exerciseposttag.map((tagObj, index) => (
                        <span 
                          key={tagObj.tag_id || index} 
                          className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1"
                        >
                          {tagObj.tag?.tag_name || 'Unknown Tag'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 italic">No exercises found</div>
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
