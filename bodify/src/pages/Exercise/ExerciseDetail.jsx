import React, { useMemo, useState } from 'react'
import { SectionTitle } from '../../components/Title/SectionTitle'
import Header from '../../layout/Header'
import Modal from 'react-modal';

export const ExerciseDetail = () => {
    const [isOpen, setIsOpen] = useState(false);
    const youtubeUrl = "https://www.youtube.com/watch?v=FeR-4_Opt-g";
    const embedUrl = useMemo(() => {
        return youtubeUrl.replace("watch?v=", "embed/");
    }, [youtubeUrl]);
  return (
    <div className='container mx-auto px-4 xl:max-w-[1067px]'>
        <Header/>
        <SectionTitle title={"20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full  Body, No Equipment, No Repeats"} className="mt-10"/>
        <div className="flex-col">
                <div className="text-sm text-gray-700 max-w-lg leading-relaxed mt-2">
                <p className='text-text text-lg'>Information</p>
                </div>
                <div className="flex flex-col md:flex-row justify-start items-start mt-1.5">
                {/* Phần mô tả */}
                <div className="w-full md:w-6/12">
                    <p className="text-xs text-gray-700 font-medium max-w-lg leading-tight">
                    Prepare yourself for a fat-burning full body HIIT workout. 
                    This all standing cardio session will leave you sweating and 
                    energized. Let's get it!
                    </p>
                </div>

                {/* Chỉ hiển thị nếu có tags */}
                {/* {value.tags.length > 0 && ( */}
                    <>
                    {/* Đường viền phân cách */}
                    <div className="hidden md:block border border-r-gray-400 h-14 mx-5"></div>

                    {/* Danh sách tags */}
                    <div className="w-full md:w-7/12 flex flex-wrap justify-start gap-2 mt-3 md:mt-0">
                        {/* {value.tags.map((tag) => ( */}
                        <span
                            // key={tag}
                            className="bg-gray-100 text-text text-xs font-medium px-3 py-1 rounded-lg"
                        >
                            Strong
                        </span>
                        {/* ))} */}
                    </div>
                    </>
                {/* )} */}
            </div>
        </div>  
        <div className="mt-4 flex flex-col md:flex-row gap-4">
  {/* Video */}
  <div className="flex-1 flex items-center justify-center min-h-[200px] md:h-[407px] bg-gray-200 mb-20">
      {/* Khi bấm vào video sẽ mở modal */}
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

      {/* Modal mở video */}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        shouldCloseOnOverlayClick={true}
        className="relative w-[90%] md:max-w-3xl max-w-sm bg-white outline-none"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[50]"
      >
        {isOpen && (
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
        )}
      </Modal>
    </div>
    </div>
    </div>
  )
}
