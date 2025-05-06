import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExerciseService from "../../services/exercise.service";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
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
      
      let exercisesData = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        exercisesData = response.data.data.filter(exercise => exercise.status_id === 2);
      } else if (Array.isArray(response.data)) {
        exercisesData = response.data.filter(exercise => exercise.status_id === 2);
      } else {
        console.error('API response does not contain an array:', response.data);
        setExercises([]);
        setFilteredExercises([]);
        setTotalPages(1);
        setError('Dữ liệu bài tập không đúng định dạng');
        return;
      }
      
      console.log('Filtered exercises (status_id = 2):', exercisesData.length);
      setExercises(exercisesData);
      setFilteredExercises(exercisesData);
      setTotalPages(Math.ceil(exercisesData.length / ITEMS_PER_PAGE));
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

  // Hàm xử lý khi click nút recommend
  const handleRecommendClick = async () => {
    try {
      // Kiểm tra đăng nhập
      if (!AuthService.isLoggedIn()) {
        setAlertMessage('Vui lòng đăng nhập để sử dụng tính năng gợi ý bài tập');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      setIsRecommending(true);
      
      // Lấy thông tin người dùng hiện tại
      const currentUser = AuthService.getCurrentUser();
      console.log('Current user:', currentUser);
      
      // Kiểm tra thông tin sức khỏe
      const userProfile = await UserService.getUserProfile(currentUser.user_id);
      console.log('User profile:', userProfile.data);
      
      if (!userProfile.data?.Health_information || userProfile.data.Health_information.trim() === '') {
        setAlertMessage('Vui lòng cập nhật thông tin sức khỏe để nhận gợi ý bài tập phù hợp');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Lấy danh sách tag được gợi ý cho người dùng
      console.log('Đang gọi getPredictTagsForUser với user_id:', currentUser.user_id);
      const tagPredictions = await RecommendService.getPredictTagsForUser(currentUser.user_id);
      console.log('Tag predictions response:', tagPredictions);
      
      // Hiển thị chi tiết hơn về response từ API
      if (tagPredictions) {
        console.log('Tag predictions raw:', JSON.stringify(tagPredictions));
        console.log('Status:', tagPredictions.status);
        console.log('Data structure:', Object.keys(tagPredictions));
      }
      
      // Check if the response is directly the data (not wrapped in a 'data' property)
      let tagsData = tagPredictions;
      
      // Handle different response structures
      if (!tagsData.recommendTags && tagPredictions.data) {
        console.log('Tags data found in tagPredictions.data');
        tagsData = tagPredictions.data;
      }
      
      if (!tagsData || !tagsData.recommendTags) {
        console.error('Không tìm thấy recommendTags trong dữ liệu trả về:', tagsData);
        setAlertMessage('Dữ liệu tag gợi ý không đúng định dạng');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      const { recommendTags, excludeTags } = tagsData;
      
      // Log chi tiết các tag được đề xuất
      console.log('Recommend Tags:', recommendTags);
      console.log('Exclude Tags:', excludeTags);
      
      // Nếu không có tag nào được đề xuất
      if (!recommendTags || recommendTags.length === 0) {
        console.warn('Không có tag nào được đề xuất cho người dùng này');
        setAlertMessage('Không có tag nào được đề xuất cho bạn');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Tìm kiếm bài tập dựa trên tag được gợi ý
      console.log('Gọi searchExercisesByTags với:', {recommendTags, excludeTags});
      const exerciseResults = await RecommendService.searchExercisesByTags(recommendTags, excludeTags || []);
      console.log('Exercise results:', exerciseResults);
      
      if (!exerciseResults || !exerciseResults.data) {
        console.error('Không có dữ liệu trả về từ API searchExercisesByTags');
        setAlertMessage('Không tìm thấy bài tập phù hợp');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Kiểm tra cấu trúc dữ liệu bài tập trả về
      let exercisesArray = null;
      
      if (Array.isArray(exerciseResults.data)) {
        exercisesArray = exerciseResults.data;
      } 
      // Trường hợp data nằm trong data
      else if (exerciseResults.data.data && Array.isArray(exerciseResults.data.data)) {
        exercisesArray = exerciseResults.data.data;
        console.log('Đã tìm thấy mảng bài tập trong exerciseResults.data.data');
      } 
      // Trường hợp kết quả nằm trong exercises hoặc exercisePosts
      else if (exerciseResults.data.exercises && Array.isArray(exerciseResults.data.exercises)) {
        exercisesArray = exerciseResults.data.exercises;
        console.log('Đã tìm thấy mảng bài tập trong exerciseResults.data.exercises');
      }
      else if (exerciseResults.data.exercisePosts && Array.isArray(exerciseResults.data.exercisePosts)) {
        exercisesArray = exerciseResults.data.exercisePosts;
        console.log('Đã tìm thấy mảng bài tập trong exerciseResults.data.exercisePosts');
      }
      
      if (!exercisesArray) {
        setAlertMessage('Dữ liệu bài tập không đúng định dạng');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setIsRecommending(false);
        return;
      }
      
      // Lọc chỉ lấy các bài tập có status_id = 2 (đã được duyệt)
      const approvedExercises = exercisesArray.filter(exercise => exercise.status_id === 2);
      console.log('Số lượng bài tập phù hợp (đã được duyệt):', approvedExercises.length);
      
      // Hiển thị kết quả
      setFilteredExercises(approvedExercises);
      setTotalPages(Math.ceil(approvedExercises.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      
      // Hiển thị thông báo thành công
      setAlertMessage(`Đã tìm thấy ${approvedExercises.length} bài tập phù hợp với bạn`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error recommending exercises:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      setAlertMessage(`Đã xảy ra lỗi khi gợi ý bài tập: ${error.message || 'Unknown error'}`);
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
                placeholder="Tìm kiếm bài tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-xs w-[300px] sm:text-base py-0 sm:py-2 pl-6 md:pl-8 text-gray-600 italic outline-none"
              />
              <button className="bg-gradient-to-r from-[#ffd26a] to-primary-500 p-3 rounded-full text-white px-8 sm:px-11 py-2 sm:py-2.5 text-base sm:text-xl">
                <FontAwesomeIcon icon={faSearch} />
              </button>
              <button
                onClick={handleRecommendClick}
                disabled={isRecommending}
                className={`${
                  isRecommending ? "bg-gray-400" : "bg-gradient-to-r from-primary-500 to-primary-700"
                } p-3 rounded-full text-white px-8 sm:px-11 py-2 sm:py-2.5 text-base sm:text-xl ml-2`}
                title="Gợi ý bài tập phù hợp"
              >
                {isRecommending ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <FontAwesomeIcon icon={faThumbsUp} />
                )}
              </button>
            </div>
          </div>
          
          {/* Alert message */}
          {showAlert && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 text-white px-6 py-3 rounded-md shadow-lg">
              {alertMessage}
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
