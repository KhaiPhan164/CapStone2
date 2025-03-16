import { useState } from "react";

export const Pagination = ({ totalPages = 9, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange && onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      {/* Nút Prev */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 flex items-center justify-center rounded-full
        disabled:opacity-50 transition-all"
      >
     <img src="icon/left.svg" alt="" className="w-4 h-4"/>
     </button>

      {/* Số trang */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-all duration-300 
            ${
              currentPage === page
                ? " text-text"
                : "text-text hover:bg-gray-300"
            }`}
        >
          {page}
        </button>
      ))}

      {/* Nút Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 flex items-center justify-center rounded-full  
        disabled:opacity-50 transition-all"
      >
     <img src="icon/right.svg" alt="" className="w-4 h-4"/>
     </button>
    </div>
  );
};
