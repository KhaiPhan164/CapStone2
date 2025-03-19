import React, { useMemo, useState } from 'react'
import { SectionTitle } from '../../components/Title/SectionTitle'
import Header from '../../layout/Header'
import Modal from 'react-modal';
import Footer from '../../layout/Footer';
import Button from '../../components/button/button';

export const ExerciseDetail = () => {
    const [isOpen, setIsOpen] = useState(false);
    const youtubeUrl = "https://www.youtube.com/watch?v=FeR-4_Opt-g";
    const embedUrl = useMemo(() => youtubeUrl.replace("watch?v=", "embed/"), [youtubeUrl]);
    const steps = [
      "Hít thở sâu, giữ ngực mở rộng và lưng thẳng.",
      "Ngồi xuống như đang ngồi vào một chiếc ghế ảo, đồng thời đẩy mông ra phía sau và giữ đầu gối không vượt qua mũi chân.",
      "Hạ thấp cơ thể cho đến khi đùi song song với mặt đất hoặc thấp hơn một chút, tùy vào khả năng linh hoạt của bạn.",
      "Giữ vị trí squat trong một khoảnh khắc, sau đó đẩy cơ thể lên bằng cách sử dụng sức mạnh từ cơ chân và cơ mông.",
      "Thở ra khi đứng lên và trở về vị trí ban đầu.",
    ];
  
    const [currentStep, setCurrentStep] = useState(1);
    return (
        <div>
            <Header />
            <div className="container mx-auto px-4 xl:max-w-[1067px]">
                <div className="flex flex-col md:flex-row gap-8 mt-10">
                    {/* Bên trái: Video + Thông tin */}
                    <div className="w-full mb-10">
                    <SectionTitle title={"20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats"} />
                        <img alt="Bài tập" className="w-full h-[400px] object-cover" src="https://placehold.co/600x400"/>
                        <div className="text-sm text-gray-700 leading-relaxed mt-2">
                            <p className='text-text text-lg font-bold'>Description</p>
                            <p className="text-xs text-gray-700 font-medium leading-tight">
                            Squat hay còn gọi là bài tập gập đùi, là một trong các bài tập gym cơ bản và hiệu quả nhất trong việc tập luyện cơ chân và cơ mông. Squat không chỉ giúp tăng cường sức mạnh và sự linh hoạt của cơ chân,
                             mông mà còn đóng vai trò quan trọng trong việc cải thiện sự cân đối và ổn định của cơ thể. 
                            Bài tập Squat có thể thực hiện mà không cần dụng cụ hoặc có thể kết hợp với tạ để tăng độ khó. Dưới đây là hướng dẫn chi tiết cách tập Squat.                            </p>
                        </div>

                        {/* Video */}
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
                        {/* -------Thực hiện---------- */}
                        <div className="text-sm text-gray-700 leading-relaxed mt-2">
                            <p className='text-text text-lg font-bold mb-3'>Perform</p>
                            {steps.map((step, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentStep(index + 1)}
                              className={`p-4 border-l-4 cursor-pointer transition-all ${
                                index + 1 === currentStep
                                  ? "border-secondary bg-[#ffe4b2] scale-105 shadow-md"
                                  : "border-gray-300 hover:bg-gray-100"
                              } rounded-md mb-2`}
                            >
                              <h3 className="font-semibold text-lg">Bước {index + 1}</h3>
                              <p className="text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Bên phải: Các bài tập liên quan */}
                    <div className="w-2/5">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-secondary border-b-2 border-secondary inline-block pb-1">
                                RELATED EXERCISES
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white shadow-md overflow-hidden flex items-center gap-4">
                                <img alt="Bánh mì ngọt" className="w-24 h-24 object-cover" src="https://placehold.co/600x400"/>
                                <div className="">
                                    <h3 className="text-sm font-semibold">Bánh mì ngọt bao nhiêu calo? Mẹo ăn ngon không lo tăng cân</h3>
                                </div>
                            </div>
                            <div className="bg-white shadow-md overflow-hidden flex items-center gap-4">
                                <img alt="Dopamine" className="w-24 h-24 object-cover" src="https://placehold.co/600x400"/>
                                <div className="">
                                    <h3 className="text-sm font-semibold">Dopamine là gì? Tác dụng, cách tăng hormone Hạnh phúc Dopamine tự nhiên</h3>
                                </div>
                            </div>
                            <div className="bg-white shadow-md overflow-hidden flex items-center gap-4">
                                <img alt="Nước ép trái cây" className="w-24 h-24 object-cover" src="https://placehold.co/600x400"/>
                                <div className="">
                                    <h3 className="text-sm font-semibold">7 công thức nước ép trái cây dành cho người tiểu đường</h3>
                                </div>
                            </div>
                            <div className='w-full flex justify-end'>
                            <Button>
                              xem thêm
                            </Button>
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

            <Footer />
        </div>
    );
}
