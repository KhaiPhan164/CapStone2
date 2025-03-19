import React from "react";

const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-b from-secondary to-primary-500 px-4 py-2 text-white font-medium transition-all duration-200 hover:opacity-80 w-32`}
    >
      {children}
    </button>
  );
};

export default Button;
