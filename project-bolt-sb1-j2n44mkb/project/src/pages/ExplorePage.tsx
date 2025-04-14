import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Location interface
interface Location {
  _id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Nearby Place interface
interface Place {
  _id: string;
  name: string;
  image: string;
  description: string;
}

export default function ExplorePage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLocation(); // Fetch location and nearby places
  }, []);

  // ✅ Fetch location details by ID
  const fetchLocation = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/locations/${id}`, {
        withCredentials: true,
      });
      setLocation(response.data);

      // ✅ Fetch nearby tourist spots based on location
      fetchNearbyPlaces(response.data._id);
    } catch (error) {
      console.error('Error fetching location:', error);
      toast.error('Failed to load location details');
      setLoading(false);
    }
  };

  // ✅ Fetch nearby places for this location
  const fetchNearbyPlaces = async (locationId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/locations/nearby/${locationId}`);
      setNearbyPlaces(response.data);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      toast.error('Failed to load nearby places');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading or error message if data not available
  if (loading) {
    return <p className='text-center text-gray-600'>Loading details...</p>;
  }

  if (!location) {
    return <p className='text-center text-red-500'>Location not found!</p>;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Location Image */}
        <img
          src={location.image}
          alt={location.name}
          className='w-full h-64 object-cover rounded-lg shadow-md'
        />
        {/* Location Details */}
        <h1 className='text-3xl font-bold text-gray-900 mt-6'>{location.name}</h1>
        <p className='text-lg text-gray-600'>{location.country}</p>
        <p className='mt-4 text-gray-700'>{location.description}</p>

        {/* Nearby Tourist Spots */}
        <div className='mt-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Nearby Tourist Places</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {nearbyPlaces.map((place) => (
              <div key={place._id} className='bg-white rounded-lg shadow-md overflow-hidden'>
                <ul className='space-y-4'>
                  {nearbyPlaces.map((place, index) => (
                    <li key={index} className='bg-white rounded-lg shadow-md p-4'>
                      <h3 className='text-xl font-semibold text-gray-800'>{place.name}</h3>
                      <Link
                        to={`/place/${place._id}`}
                        className='text-blue-600 hover:underline mt-2 inline-block'
                      >
                        View Details
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Small Image */}
                <img src={place.image} alt={place.name} className='w-full h-48 object-cover' />
                <div className='p-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>{place.name}</h3>
                  <p className='text-gray-600 mt-2'>{place.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
