import React, { useState, useEffect } from 'react';
import { Clock, DollarSign } from 'lucide-react';

// Define the interface for Tourist Spot
interface TouristSpot {
  _id: string;
  name: string;
  description: string;
  image: string;
  bestTime?: string;
  entryFee?: string;
}

export default function TouristPlacesPage() {
  // State to hold tourist spots data
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchTouristSpots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tourist-spots');
        if (!response.ok) {
          throw new Error('Failed to fetch tourist spots');
        }
        const data = await response.json();
        setTouristSpots(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTouristSpots();
  }, []);

  // Show loading state
  if (loading) {
    return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
  }

  // Show error if any
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center text-red-600'>{error}</div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Popular Tourist Spots</h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {touristSpots.map((spot) => (
            <div key={spot._id} className='bg-white rounded-xl shadow-lg overflow-hidden'>
              <img src={spot.image} alt={spot.name} className='w-full h-64 object-cover' />
              <div className='p-6'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>{spot.name}</h2>
                <p className='text-gray-600 mb-4'>{spot.description}</p>

                <div className='space-y-3'>
                  {spot.bestTime && (
                    <div className='flex items-center text-gray-700'>
                      <Clock className='h-5 w-5 mr-2' />
                      <span>Best Time: {spot.bestTime}</span>
                    </div>
                  )}
                  {spot.entryFee && (
                    <div className='flex items-center text-gray-700'>
                      <DollarSign className='h-5 w-5 mr-2' />
                      <span>Entry Fee: {spot.entryFee}</span>
                    </div>
                  )}
                </div>

                <button className='mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'>
                  Add to Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
