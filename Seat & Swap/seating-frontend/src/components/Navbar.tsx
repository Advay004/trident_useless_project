// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold">Admin Panel</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/students" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
              Students
            </Link>
            <Link to="/bench-layout" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
              Benches
            </Link>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-400 focus:outline-none"
              aria-expanded="false"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/students" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
            Students
          </Link>
          <Link to="/bench-layout" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
            Benchs
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
