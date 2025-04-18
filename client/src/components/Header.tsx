import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Toggle menu visibility on small screens
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-300 transition-colors">
          OutFlo
        </Link>

        {/* Hamburger Menu Icon on small screens */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-2xl focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? '×' : '☰'}
        </button>

        {/* Navigation Links */}
        <nav
          className={`lg:flex items-center space-x-6 lg:space-x-6 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'block' : 'hidden'
          } lg:block`}
        >
          <ul className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 mx-4">
            <li>
              <Link
                to="/"
                className="hover:underline hover:text-blue-300 transition-colors mx-3"
              >
                Campaigns 
              </Link>
            </li>
            <li>
              <Link
                to="/message"
                className="hover:underline hover:text-blue-300 transition-colors mx-3"
              >
                Message Generator
              </Link>
            </li>
            <li>
              <Link
                to="/leads"
                className="hover:underline hover:text-blue-300 transition-colors mx-3"
              >
                LinkedIn Leads
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
