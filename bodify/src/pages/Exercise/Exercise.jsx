import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar } from '@fortawesome/free-solid-svg-icons';
import RecommendService from '../../services/recommend';
import ExerciseService from '../../services/exercise.service';
import ExerciseCard from '../../components/Card/ExerciseCard';

const Exercise = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'strength', label: 'Strength' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'running', label: 'Running' },
    { id: 'recommended', label: 'For You', icon: faStar }
  ];

  useEffect(() => {
    if (selectedFilter === 'recommended') {
      fetchRecommendedExercises();
    } else {
      fetchExercises();
    }
  }, [selectedFilter]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await ExerciseService.getAll();
      
      // Lọc lấy chỉ bài tập có status_id = 2 (đã được duyệt)
      const approvedExercises = response.data.filter(exercise => exercise.status_id === 2);
      
      if (selectedFilter !== 'all') {
        const filtered = approvedExercises.filter(exercise => 
          exercise.tags && exercise.tags.some(tag => tag.tag_name.toLowerCase() === selectedFilter)
        );
        setExercises(filtered);
      } else {
        setExercises(approvedExercises);
      }
      setError(null);
    } catch (error) {
      setError('Error fetching exercises');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedExercises = async () => {
    if (!user) {
      setError('Please login to see personalized recommendations');
      setExercises([]);
      return;
    }

    try {
      setLoading(true);
      // 1. Get health analysis to get tags
      const healthAnalysis = await RecommendService.getHealthAnalysis(user.user_id);
      
      if (healthAnalysis.status === 'success') {
        const { workout_tags, health_info_tags, illness_tags } = healthAnalysis.data.analysis;
        
        if (!workout_tags.length && !health_info_tags.length && !illness_tags.length) {
          setError('Please update your health information to get personalized recommendations');
          setExercises([]);
          return;
        }

        // 2. Get exercises based on tags
        const allTags = [...workout_tags, ...health_info_tags];
        const exercisesResponse = await ExerciseService.getExercisesByTags(allTags);
        
        if (exercisesResponse && exercisesResponse.length > 0) {
          // Lọc chỉ lấy bài tập đã được duyệt
          const approvedExercises = exercisesResponse.filter(exercise => exercise.status_id === 2);
          
          // Add matching tags to each exercise for display
          const exercisesWithTags = approvedExercises.map(exercise => ({
            ...exercise,
            matching_tags: exercise.tags.filter(tag => 
              allTags.includes(tag.tag_name)
            ).map(tag => tag.tag_name)
          }));
          
          setExercises(exercisesWithTags);
          setError(null);
        } else {
          setError('No exercises found matching your health profile');
          setExercises([]);
        }
      } else {
        setError('Could not analyze your health profile');
        setExercises([]);
      }
    } catch (error) {
      console.error('Error in recommendations:', error);
      setError('Error getting recommendations');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchExercises();
      return;
    }

    try {
      setLoading(true);
      const response = await ExerciseService.searchExercises(searchTerm);
      
      // Lọc chỉ lấy bài tập đã được duyệt (status_id = 2)
      const approvedExercises = response.filter(exercise => exercise.status_id === 2);
      
      setExercises(approvedExercises);
      setError(null);
    } catch (error) {
      setError('Error searching exercises');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-700 mb-8 text-center">
        Exercise Library
      </h1>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary-500 text-white rounded-full hover:bg-primary-600"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-2xl mx-auto">
          <span className="block sm:inline">{error}</span>
          {(!user && error.includes('login')) && (
            <button
              onClick={() => navigate('/login')}
              className="ml-4 underline hover:text-red-800"
            >
              Login now
            </button>
          )}
          {(user && error.includes('health information')) && (
            <button
              onClick={() => navigate('/profile')}
              className="ml-4 underline hover:text-red-800"
            >
              Update health profile
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              matchingTags={exercise.matching_tags}
              onClick={() => navigate(`/exercise/${exercise.id}`)}
            />
          ))
        ) : (
          !loading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No exercises found
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Exercise; 