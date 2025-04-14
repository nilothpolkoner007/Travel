import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, MapPin, Car, Route } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className='bg-white shadow-lg'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between h-16'>
          <div className='flex space-x-8'>
            <Link to='/' className='flex items-center'>
              <Compass className='h-6 w-6 text-blue-600' />
              <span className='ml-2 text-xl font-bold text-gray-800'>TravelGuide</span>
            </Link>

            <div className='hidden md:flex items-center space-x-4'>
              <Link
                to='/'
                className='flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
              >
                <MapPin className='h-5 w-5 mr-1' />
                <span>Locations</span>
              </Link>
              <Link
                to='/tourist-places'
                className='flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
              >
                <Compass className='h-5 w-5 mr-1' />
                <span>Tourist Places</span>
              </Link>
              <Link
                to='/transport-hotels'
                className='flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
              >
                <Car className='h-5 w-5 mr-1' />
                <span>Transport & Hotels</span>
              </Link>
              <Link
                to='/route-planning'
                className='flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
              >
                <Route className='h-5 w-5 mr-1' />
                <span>Route Planning</span>
              </Link>
            </div>
          </div>

          <div className='flex items-center'>
            <div className='hidden md:flex items-center space-x-4'>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className='px-3 py-2 rounded-md text-gray-700 hover:text-red-600'
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to='/login'
                    className='px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='px-3 py-2 rounded-md text-gray-700 hover:text-blue-600'
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
