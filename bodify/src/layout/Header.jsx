import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }),
    [showMobileMenu];
  return (
    <div className=" ">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/">
          <img
            src="./icon/logo.svg"
            alt="Logo"
            className="h-10 w-auto ml-10 cursor-pointer"
          />
        </Link>
        <ul className="hidden md:flex gap-7 text-black">
          <a
            href="#Header"
            className="cursor-pointer 
                hover:text-gray-400"
          >
            Home
          </a>
          <Link to="/exercise">
          <a
            className="cursor-pointer 
                hover:text-gray-400"
          >
            Exercise
          </a>
          </Link>
          <a
            href="#Programs"
            className="cursor-pointer 
                hover:text-gray-400"
          >
            Programs
          </a>
          <a
            href="#Contact"
            className="cursor-pointer 
                hover:text-gray-400"
          >
            Contact
          </a>
        </ul>
        <button
          className="hidden md:block bg-black text-white px-8 py-2 rounded-full mr-10"
          onClick={() => {
            navigate("/sign-up");
          }}
        >
          Sign up
        </button>
      </div>
      {/* ------ mobile menu -------- */}
      <div
        className={`md:hidden ${
          showMobileMenu ? "fixed w-full" : "h-0 w-0"
        } right-0 top-0 bottom-0 overflow-hidden bg-white transition-all`}
      >
        <div className="flex justify-end p-6 cursor-pointer"></div>
        <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Home"
            className="px-4 py-2 rounded-full inline-block"
          >
            Home
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#About"
            className="px-4 py-2 rounded-full inline-block"
          >
            About
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Projects"
            className="px-4 py-2 rounded-full inline-block"
          >
            Projects
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Testimonails"
            className="px-4 py-2 rounded-full inline-block"
          >
            Testimonails
          </a>
        </ul>
      </div>
    </div>
  );
};

export default Header;
