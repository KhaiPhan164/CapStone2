import React, { useEffect, useMemo, useState } from 'react'
import { SectionTitle } from '../../components/Title/SectionTitle'
import Modal from 'react-modal';
import Button from '../../components/button/button';
import { useParams } from 'react-router-dom';
import ExerciseService from '../../services/exercise.service';
import { Link } from 'react-router-dom';

export const ExerciseDetail = () => {
    const { id } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exercise, setExercise] = useState(null);
    const [steps, setSteps] = useState([]);
    const [relatedExercises, setRelatedExercises] = useState([]);
    
    const youtubeUrl = exercise?.video_rul || "https://www.youtube.com/watch?v=FeR-4_Opt-g";
    const embedUrl = useMemo(() => youtubeUrl.replace("watch?v=", "embed/"), [youtubeUrl]);
    
    const [currentStep, setCurrentStep] = useState(1);
    
    useEffect(() => {
        fetchExerciseDetails();
    }, [id]);
    
    const fetchExerciseDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Lấy thông tin chi tiết bài tập
            const exerciseResponse = await ExerciseService.getById(id);
            const exerciseData = exerciseResponse.data.data || exerciseResponse.data;
            
            // Chỉ log này để kiểm tra dữ liệu
            console.log('EXERCISE DETAIL DATA:', exerciseData);
            
            setExercise(exerciseData);
            
            // Kiểm tra và sử dụng step từ response (không phải steps)
            if (exerciseData.step && Array.isArray(exerciseData.step)) {
                setSteps(exerciseData.step);
            } else {
                setSteps([]);
            }
            
            // Lấy các bài tập liên quan (chỉ lấy 3 bài tập)
            const allExercisesResponse = await ExerciseService.getAll();
            const allExercises = allExercisesResponse.data.data || allExercisesResponse.data;
            
            if (Array.isArray(allExercises)) {
                // Lọc ra các bài tập khác với bài tập hiện tại và lấy tối đa 3 bài
                const related = allExercises
                    .filter(ex => ex.exercisepost_id !== parseInt(id))
                    .slice(0, 3);
                setRelatedExercises(related);
            }
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            setError('Không thể tải chi tiết bài tập. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div>
                <div className="container mx-auto px-4 xl:max-w-[1067px] flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }
    
    if (error || !exercise) {
        return (
            <div>
                <div className="container mx-auto px-4 xl:max-w-[1067px] flex items-center justify-center min-h-[400px]">
                    <div className="text-red-500 text-center">
                        {error || 'Không tìm thấy bài tập này'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8 mt-10">
                    {/* Bên trái: Video + Thông tin */}
                    <div className="w-full md:w-3/5 mb-10">
                        <SectionTitle title={exercise.name} />
                        <img 
                            alt={exercise.name} 
                            className="w-full h-[400px] object-cover" 
                            src={exercise.img_url || "https://placehold.co/600x400"}
                            onError={(e) => {
                                e.target.src = "https://placehold.co/600x400";
                            }}
                        />
                        <div className="text-sm text-gray-700 leading-relaxed mt-2">
                            <p className='text-text text-lg font-bold'>Description</p>
                            <p className="text-xs text-gray-700 font-medium leading-tight">
                                {exercise.description}
                            </p>
                        </div>

                        {/* Video */}
                        {exercise.video_rul && (
                            <div className="mt-4 flex flex-col items-center justify-center min-h-[200px] md:h-[407px] bg-gray-200">
                                <div className="w-full h-full cursor-pointer" onClick={() => setIsOpen(true)}>
                                    <iframe
                                        className="w-full h-[200px] sm:h-full pointer-events-none"
                                        src={embedUrl}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}
                        
                        {/* -------Thực hiện---------- */}
                        {steps.length > 0 && (
                            <div className="text-sm text-gray-700 leading-relaxed mt-2">
                                <p className='text-text text-lg font-bold mb-3'>Perform</p>
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id || index}
                                        onClick={() => setCurrentStep(index + 1)}
                                        className={`p-4 border-l-4 cursor-pointer transition-all ${
                                            index + 1 === currentStep
                                                ? "border-secondary bg-[#ffe4b2] scale-105 shadow-md"
                                                : "border-gray-300 hover:bg-gray-100"
                                        } rounded-md mb-2`}
                                    >
                                        <h3 className="font-semibold text-lg">Step {step.step_number || index + 1}</h3>
                                        <p className="text-gray-700">{step.instruction}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bên phải: Các bài tập liên quan */}
                    <div className="w-full md:w-2/5">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-secondary border-b-2 border-secondary inline-block pb-1">
                                RELATED EXERCISES
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {relatedExercises.length > 0 ? (
                                relatedExercises.map(relatedExercise => (
                                    <Link 
                                        to={`/exercise-post/${relatedExercise.exercisepost_id}`} 
                                        key={relatedExercise.exercisepost_id}
                                        className="bg-white shadow-md overflow-hidden flex items-center gap-4 hover:shadow-lg transition-shadow"
                                    >
                                        <img 
                                            alt={relatedExercise.name} 
                                            className="w-24 h-24 object-cover" 
                                            src={relatedExercise.img_url || "https://placehold.co/600x400"}
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/600x400";
                                            }}
                                        />
                                        <div className="">
                                            <h3 className="text-sm font-semibold">{relatedExercise.name}</h3>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No related exercises</div>
                            )}
                            <div className='w-full flex justify-end'>
                                <Link to="/exercise">
                                    <Button>
                                        See more
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal mở video */}
            <Modal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                shouldCloseOnOverlayClick={true}
                className="relative w-[90%] md:max-w-3xl bg-white outline-none rounded-lg shadow-lg"
                overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[50]"
            >
                <div className="relative w-full h-[80vh] md:h-[90vh]">
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
            </Modal>
        </div>
    );
}
