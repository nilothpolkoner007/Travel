import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';

export default function RoutePlanningPage() {
  const [touristSpots, setTouristSpots] = useState([]);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch all unique locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tourist-spots');
        const data = await res.json();

        const uniqueLocations = Array.from(
          new Set(
            data
              .map((spot) => spot.location?.name || spot.location || '')
              .filter((loc) => loc !== ''),
          ),
        );

        setLocations(uniqueLocations);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };

    fetchLocations();
  }, []);

  // Fetch tourist spots when location changes
  useEffect(() => {
    const fetchTouristSpots = async () => {
      try {
        const url = locationFilter
          ? `http://localhost:5000/api/tourist-spots?location=${encodeURIComponent(locationFilter)}`
          : 'http://localhost:5000/api/tourist-spots';

        const res = await fetch(url);
        const data = await res.json();

        setTouristSpots(data);
        // Optionally auto-select all spots
         setSelectedSpots(data.map((spot) => spot._id));
      } catch (err) {
        console.error('Failed to fetch tourist spots:', err);
      }
    };

    fetchTouristSpots();
  }, [locationFilter]);

  const toggleSpot = (spotId: string) => {
    setSelectedSpots((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId],
    );
  };

  const getPlaceNameById = (id: string) => {
    const spot = touristSpots.find((s) => s._id === id);
    return spot?.name || 'Unknown Place';
  };

  const generateRoute = () => {
    return selectedSpots.map(getPlaceNameById).join(' → ');
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Route Planning</h1>
        <p className='text-gray-600'>
          Plan your perfect day by selecting the places you want to visit
        </p>
      </div>

      {/* Location Filter */}
      <div className='mb-6 flex items-center gap-2'>
        <MapPin className='h-5 w-5 text-gray-500' />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
        >
          <option value=''>All Locations</option>
          {locations.map((loc, i) => (
            <option key={i} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Tourist Spots List */}
        <div className='lg:col-span-2'>
          <div className='grid gap-6'>
            {touristSpots.map((spot) => (
              <div
                key={spot._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                  selectedSpots.includes(spot._id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className='flex flex-col md:flex-row'>
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className='w-full md:w-48 h-48 object-cover'
                  />
                  <div className='p-6 flex-1'>
                    <div className='flex justify-between items-start'>
                      <h3 className='text-xl font-semibold text-gray-900'>{spot.name}</h3>
                      <button
                        onClick={() => toggleSpot(spot._id)}
                        className={`px-4 py-2 rounded-lg ${
                          selectedSpots.includes(spot._id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedSpots.includes(spot._id) ? 'Selected' : 'Add to Route'}
                      </button>
                    </div>
                    <div className='mt-4 grid grid-cols-2 gap-4'>
                      <div className='flex items-center text-gray-600'>
                        <Clock className='h-5 w-5 mr-2' />
                        <span>{spot.duration}</span>
                      </div>
                      <div className='flex items-center text-gray-600'>
                        <Navigation className='h-5 w-5 mr-2' />
                        <span>{spot.distance}</span>
                      </div>
                      <div className='flex items-center text-gray-600'>
                        <Clock className='h-5 w-5 mr-2' />
                        <span>Best time: {spot.bestTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-xl shadow-lg p-6 sticky top-8'>
            <h3 className='text-xl font-semibold mb-4'>Your Route</h3>
            {selectedSpots.length === 0 ? (
              <p className='text-gray-600'>Select places to create your route</p>
            ) : (
              <div className='space-y-4'>
                {selectedSpots.map((spotId, index) => {
                  const spot = touristSpots.find((s) => s._id === spotId);
                  if (!spot) return null;
                  return (
                    <div key={spot._id} className='flex items-start'>
                      <div className='flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white'>
                        {index + 1}
                      </div>
                      <div className='ml-4'>
                        <h4 className='font-medium'>{spot.name}</h4>
                        <p className='text-sm text-gray-600'>{spot.bestTime}</p>
                      </div>
                    </div>
                  );
                })}
                <div className='mt-4 text-sm text-gray-500'>{generateRoute()}</div>
                <button className='w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors'>
                  Get Directions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
