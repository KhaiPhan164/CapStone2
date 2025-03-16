import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export const SearchBox = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
  <div className="">
    <div className="flex items-center max-w-[300px] sm:max-w-xl mx-auto rounded-full border border-gray-400 overflow-hidden shadow-sm">
      <input
        type="text"
        placeholder="Bạn tìm bài tập như thế nào?"
        className="flex-1 text-xs w-[300px] sm:text-base py-0 sm:py-2 pl-6 md:pl-8 text-gray-600 italic outline-none"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button
      className=" bg-gradient-to-r from-[#ffd26a] to-primary-500 p-3 rounded-full text-white px-8 sm:px-11 py-2 sm:py-2.5 text-base sm:text-xl">
      <FontAwesomeIcon icon={faSearch} />
      </button>
    </div>
    <div class="flex space-x-4 mt-5">
        <button class="px-4 py-1 bg-gray-200 text-gray-700 rounded-full border border-gray-400">Cardio</button>
        <button class="px-4 py-1 bg-gray-200 text-gray-700 rounded-full border border-gray-400">Sức mạnh</button>
        <button class="px-4 py-1 bg-gray-200 text-gray-700 rounded-full border border-gray-400">Yoga</button>
        <button class="px-4 py-1 bg-gray-200 text-gray-700 rounded-full border border-gray-400">Chạy bộ</button>
    </div>
  </div>
 );
};
