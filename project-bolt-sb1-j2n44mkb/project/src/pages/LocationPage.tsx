import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Location {
  _id: string;
  name: string;
  country: string;
  image: string;
  description: string;
}

export default function LocationPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLocations();
  }, []);

const fetchLocations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/locations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    setLocations(response.data);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    if (error.response?.status === 401) {
      toast.error('Session expired, please log in again.');
      navigate('/login'); // Redirect to login if unauthorized
    } else {
      toast.error('Failed to load locations');
    }
  } finally {
    setLoading(false);
  }
};


  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Discover Your Next Adventure</h1>
          <p className='text-xl text-gray-600'>Search for cities, countries, or landmarks</p>
        </div>

        <div className='max-w-3xl mx-auto mb-12'>
          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search locations...'
              className='w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <Search className='absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6' />
          </div>
        </div>

        {loading ? (
          <p className='text-center text-gray-600'>Loading locations...</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {filteredLocations.map((location) => (
              <div
                key={location._id}
                className='bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105'
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className='h-48 w-full object-cover'
                />
                <div className='p-6'>
                  <h3 className='text-xl font-semibold text-gray-900'>{location.name}</h3>
                  <p className='text-sm text-gray-600 mb-4'>{location.country}</p>
                  <p className='text-gray-700'>{location.description}</p>
                  <button
                    onClick={() => navigate(`/explore/${location._id}`)}
                    className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
