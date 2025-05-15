import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExerciseService from "../../services/exercise.service";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faThumbsUp, faFilter, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "../../components/Table/Pagination";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import RecommendService from "../../services/recommend";

export const ExerciseHome = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSearchingByTags, setIsSearchingByTags] = useState(false);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchExercises();
    fetchAllTags();
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
      
      let exercisesData = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        exercisesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        exercisesData = response.data;
      } else {
        console.error('API response does not contain an array:', response.data);
        setExercises([]);
        setFilteredExercises([]);
        setTotalPages(1);
        setError('Exercise data has incorrect format');
        return;
      }
      
      // Check if exercises have status_id
      const missingStatusExercises = exercisesData.filter(exercise => 
        exercise.status_id === undefined || exercise.status_id === null
      );
      
      if (missingStatusExercises.length > 0) {
        console.warn(`${missingStatusExercises.length} exercises have undefined/null status_id`);
      }
      
      // Edit filter logic - only filter if status_id exists
      if (exercisesData.some(exercise => exercise.status_id !== undefined)) {
        exercisesData = exercisesData.filter(exercise => exercise.status_id === 2);
        
        // If no exercises remain after filtering, show all exercises
        if (exercisesData.length === 0 && response.data.length > 0) {
          exercisesData = Array.isArray(response.data.data) ? response.data.data : response.data;
        }
      }
      
      setExercises(exercisesData);
      setFilteredExercises(exercisesData);
      setTotalPages(Math.ceil(exercisesData.length / ITEMS_PER_PAGE));
    } catch (error) {
      setError('Unable to load exercise list');
      console.error('Error fetching exercises:', error);
      setExercises([]);
      setFilteredExercises([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const response = await ExerciseService.getAllTags();
      if (response && response.data) {
        // Handle tag data that may have different structures
        let tags = [];
        if (Array.isArray(response.data)) {
          tags = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          tags = response.data.data;
        }
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setAvailableTags([]);
    }
  };

  // Function to handle recommend button click
  const handleRecommendClick = async () => {
    try {
      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        setAlertMessage('Please log in to use the exercise recommendation feature');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      setIsRecommending(true);
      
      // Get current user information
      const currentUser = AuthService.getCurrentUser();
      
      // Check health information
      const userProfile = await UserService.getUserProfile(currentUser.user_id);
      
      if (!userProfile.data?.Health_information || userProfile.data.Health_information.trim() === '') {
        setAlertMessage('Please update your health information to get suitable exercise recommendations');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Get recommended tags for user
      const tagPredictions = await RecommendService.getPredictTagsForUser(currentUser.user_id);
      
      // Check if the response is directly the data (not wrapped in a 'data' property)
      let tagsData = tagPredictions;
      
      // Handle different response structures
      if (!tagsData.recommendTags && tagPredictions.data) {
        tagsData = tagPredictions.data;
      }
      
      if (!tagsData || !tagsData.recommendTags) {
        console.error('recommendTags not found in response data');
        setAlertMessage('Recommended tag data is in incorrect format');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      const { recommendTags, excludeTags } = tagsData;
      
      // If no tags are recommended
      if (!recommendTags || recommendTags.length === 0) {
        setAlertMessage('No recommended tags found for you');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Search for exercises based on recommended tags
      const exerciseResults = await RecommendService.searchExercisesByTags(recommendTags, excludeTags || []);
      
      if (!exerciseResults || !exerciseResults.data) {
        setAlertMessage('No suitable exercises found');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Check exercise data structure in response
      let exercisesArray = null;
      
      if (Array.isArray(exerciseResults.data)) {
        exercisesArray = exerciseResults.data;
      } 
      // Case where data is inside data
      else if (exerciseResults.data.data && Array.isArray(exerciseResults.data.data)) {
        exercisesArray = exerciseResults.data.data;
      } 
      // Case where results are in exercises or exercisePosts
      else if (exerciseResults.data.exercises && Array.isArray(exerciseResults.data.exercises)) {
        exercisesArray = exerciseResults.data.exercises;
      }
      else if (exerciseResults.data.exercisePosts && Array.isArray(exerciseResults.data.exercisePosts)) {
        exercisesArray = exerciseResults.data.exercisePosts;
      }
      
      if (!exercisesArray) {
        setAlertMessage('Exercise data is in incorrect format');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Filter to only get exercises with status_id = 2 (approved)
      const approvedExercises = exercisesArray.filter(exercise => exercise.status_id === 2);
      
      // Display results
      setFilteredExercises(approvedExercises);
      setTotalPages(Math.ceil(approvedExercises.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      
      // Display success message
      setAlertMessage(`Found ${approvedExercises.length} exercises suitable for you`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error recommending exercises:', error);
      setAlertMessage(`An error occurred while recommending exercises: ${error.message || 'Unknown error'}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsRecommending(false);
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

  // Function to search exercises based on selected tags
  const handleTagSearch = async () => {
    try {
      if (selectedTags.length === 0) {
        setAlertMessage("Please select at least one tag to search");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      setIsSearchingByTags(true);
      // Get names of selected tags
      const tagNames = selectedTags.map(tag => tag.tag_name);
      
      // Call search by tags API
      const results = await RecommendService.searchExercisesByTags(tagNames, []);
      
      // Process results
      let exercisesArray = [];
      if (results && results.data && Array.isArray(results.data)) {
        exercisesArray = results.data;
      } else if (results && results.data && results.data.data && Array.isArray(results.data.data)) {
        exercisesArray = results.data.data;
      } else if (results && results.data && results.data.exercisePosts && Array.isArray(results.data.exercisePosts)) {
        exercisesArray = results.data.exercisePosts;
      }

      // Check for exercises without status_id
      const missingStatusExercises = exercisesArray.filter(exercise => 
        exercise.status_id === undefined || exercise.status_id === null
      );
      
      // Filter logic - show all exercises if no status_id exists
      // Only filter by status_id if this field exists
      let approvedExercises = exercisesArray;
      if (exercisesArray.some(exercise => exercise.status_id !== undefined)) {
        // If there are exercises with status_id, filter by status_id = 2
        approvedExercises = exercisesArray.filter(exercise => exercise.status_id === 2);
        
        // If no exercises remain after filtering, show all exercises
        if (approvedExercises.length === 0 && exercisesArray.length > 0) {
          approvedExercises = exercisesArray;
        }
      }
      
      // Update display list
      setFilteredExercises(approvedExercises);
      setTotalPages(Math.ceil(approvedExercises.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      
      // Display message
      setAlertMessage(`Found ${approvedExercises.length} exercises matching selected tags`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      
      // Close popup
      setShowTagSearch(false);
      
    } catch (error) {
      console.error("Error searching by tags:", error);
      setAlertMessage("An error occurred while searching by tags");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsSearchingByTags(false);
    }
  };

  // Function to handle tag click
  const handleTagClick = (tag) => {
    // Check if tag is already selected
    const isSelected = selectedTags.some(t => t.tag_id === tag.tag_id);
    
    if (isSelected) {
      // If already selected, remove tag
      setSelectedTags(selectedTags.filter(t => t.tag_id !== tag.tag_id));
    } else {
      // If not selected, add tag to selected list
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Function to reset search
  const resetSearch = () => {
    setSelectedTags([]);
    setFilteredExercises(exercises);
    setTotalPages(Math.ceil(exercises.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
    setSearchTerm('');
    setShowTagSearch(false);
    
    setAlertMessage("Search reset successfully");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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
            <div className="flex items-center max-w-md md:max-w-xl mx-auto rounded-full overflow-hidden shadow-md bg-white">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-12 text-sm md:text-base py-2 pl-6 pr-2 text-gray-700 focus:outline-none border-0"
              />
              <div className="flex">
                <button 
                  className="h-12 px-5 bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center justify-center"
                  title="Search exercises"
                >
                  <FontAwesomeIcon icon={faSearch} className="text-lg" />
                </button>
                
                <button
                  onClick={handleRecommendClick}
                  disabled={isRecommending}
                  className={`h-12 px-5 ${
                    isRecommending ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
                  } text-white transition-colors flex items-center justify-center`}
                  title="Recommend suitable exercises"
                >
                  {isRecommending ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <FontAwesomeIcon icon={faThumbsUp} className="text-lg" />
                  )}
                </button>
                
                <button
                  onClick={() => setShowTagSearch(true)}
                  className="h-12 px-5 bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center"
                  title="Search by tag"
                >
                  <FontAwesomeIcon icon={faFilter} className="text-lg" />
                </button>
              </div>
            </div>
            
            {/* Display selected tags if any */}
            {selectedTags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-gray-600">Selected tags:</span>
                {selectedTags.map(tag => (
                  <span 
                    key={tag.tag_id} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                  >
                    {tag.tag_name}
                    <button 
                      onClick={() => setSelectedTags(selectedTags.filter(t => t.tag_id !== tag.tag_id))}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </span>
                ))}
                <button 
                  onClick={resetSearch}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          
          {/* Alert message */}
          {showAlert && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 text-white px-6 py-3 rounded-md shadow-lg">
              {alertMessage}
            </div>
          )}
          
          {/* Tag Search Popup */}
          {showTagSearch && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Search by Tag</h2>
                  <button 
                    onClick={() => setShowTagSearch(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                
                <p className="mb-4 text-gray-600">
                  Select one or more tags to find suitable exercises:
                </p>
                
                {availableTags.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto mb-6">
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag.tag_id}
                          onClick={() => handleTagClick(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                            selectedTags.some(t => t.tag_id === tag.tag_id)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {selectedTags.some(t => t.tag_id === tag.tag_id) && (
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                          )}
                          {tag.tag_name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No tags available. Loading...</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTagSearch(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTagSearch}
                    disabled={selectedTags.length === 0 || isSearchingByTags}
                    className={`px-4 py-2 rounded-md ${
                      selectedTags.length === 0 || isSearchingByTags
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isSearchingByTags ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
                        {/* Handle different tag structures */}
                        {exercise.exerciseposttag && exercise.exerciseposttag.map((tagObj) => (
                          <span
                            key={tagObj.tag?.tag_id || tagObj.tag_id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tagObj.tag?.tag_name || tagObj.tag_name}
                          </span>
                        ))}
                        {/* Handle case where tags is a direct array */}
                        {exercise.tags && Array.isArray(exercise.tags) && exercise.tags.map((tag) => (
                          <span
                            key={tag.tag_id || tag.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag.tag_name || tag.name}
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
