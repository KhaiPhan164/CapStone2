import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExerciseService from "../../services/exercise.service";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "../../components/Table/Pagination";

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
      
      const response = await ExerciseService.getAll();
      console.log('API response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        const exercisesData = response.data.data;
        setExercises(exercisesData);
        setFilteredExercises(exercisesData);
        setTotalPages(Math.ceil(exercisesData.length / ITEMS_PER_PAGE));
      } else if (Array.isArray(response.data)) {
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

  const getCurrentPageExercises = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Banner and Search section */}
        <div className="mt-14 flex flex-col gap-y-6 items-center justify-start px-4 md:px-0">
          <div className="flex flex-col items-center gap-y-4 text-center">
            <h1 className="flex text-[#00000096] text-4xl md:text-6xl space-x-3 items-center font-medium">
              <p>Exercise List</p>
            </h1>
          </div>
          {/* Search box */}
          <div className="">
            <div className="flex items-center max-w-[300px] sm:max-w-xl mx-auto rounded-full border border-gray-400 overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search for exercises..."
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

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {getCurrentPageExercises().map((exercise) => (
                <Link
                  key={exercise.exercisepost_id || exercise.exercise_post_id}
                  to={`/exercise/${exercise.exercisepost_id || exercise.exercise_post_id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={exercise.img_url || "https://placehold.co/600x400"}
                      alt={exercise.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/600x400";
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.exerciseposttag?.map((tagObj) => (
                          <span
                            key={tagObj.tag?.tag_id || tagObj.tag_id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tagObj.tag?.tag_name || tagObj.tag_name}
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
    </div>
  );
};
