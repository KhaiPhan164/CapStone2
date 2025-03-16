import { Link } from "react-router-dom";
import { Pagination } from "../../../components/Table/Pagination";
import { SectionTitle } from "../../../components/Title/SectionTitle";

export const PopularSearch = () => {
const videos = [
    {
        title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
        image: "https://storage.googleapis.com/a1aa/image/xPKBzg8e_xdhgP58Kcw5oGziRKmmPqtl5VIJ4nsHNzQ.jpg",
    },
    {
      title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
      image: "https://storage.googleapis.com/a1aa/image/PJOXS6_L0XtcT1TJxhX06iyY7-TnA5en7VxJHFp5eag.jpg",
    },
    {
      title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
      image: "https://storage.googleapis.com/a1aa/image/xPKBzg8e_xdhgP58Kcw5oGziRKmmPqtl5VIJ4nsHNzQ.jpg",
    },
    {
      title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
      image: "https://storage.googleapis.com/a1aa/image/PJOXS6_L0XtcT1TJxhX06iyY7-TnA5en7VxJHFp5eag.jpg",
    },
    {
      title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
      image: "https://storage.googleapis.com/a1aa/image/xPKBzg8e_xdhgP58Kcw5oGziRKmmPqtl5VIJ4nsHNzQ.jpg",
    },
    {
      title: "5 MIN COOL DOWN 20 MIN CARDIO HIIT WORKOUT - ALL STANDING - Full Body, No Equipment, No Repeats",
      image: "https://storage.googleapis.com/a1aa/image/PJOXS6_L0XtcT1TJxhX06iyY7-TnA5en7VxJHFp5eag.jpg",
    },
    ];
 return (
  <div className="container mx-auto px-4 xl:max-w-[1067px] flex flex-col gap-5 pb-5 mt-5">
   <div className="flex items-center justify-between ">
    <div className="flex flex-1 w-full items-center overflow-hidden">
     <div className="min-w-fit">
      <SectionTitle title="Exercise" />
     </div>
    </div>
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video, index) => (
        <div key={index} className="bg-white shadow-md overflow-hidden">
          <Link to="/exercise-post">
          <img src={video.image} alt={video.title} className="w-full" height="400" width="600" />
          </Link>
          <div className="pb-4 pt-2 px-2">
            <h2 className="text-lg font-bold leading-5">{video.title}</h2>
            <p className="text-sm text-gray-600 mt-2">
              Prepare yourself for a fat-burning full body HIIT workout. This all standing cardio session will leave you sweating and energized. Let's get it!
            </p>
            <div className="mt-2">
              <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1">Cardio</span>
              <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1">Yoga</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <Pagination/>
  </div>
 );
};
