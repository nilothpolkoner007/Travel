import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Location {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

const defaultLocation: Location = {
  _id: '',
  name: '',
  country: '',
  description: '',
  image: '',
  coordinates: { lat: '', lng: '' },
};

export default function AdminExplore() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationData, setLocationData] = useState<Location>(defaultLocation);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchLocations();
  }, []);

const fetchLocations = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/api/admin/locations`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log('Frontend Received Data:', response.data);
    setLocations(response.data);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    toast.error('Failed to fetch locations');
  } finally {
    setLoading(false);
  }
}, []);


  const handleSubmitLocation = async () => {
    if (!user?.isAdmin) {
      return toast.error('Access Denied: Only admins can modify locations');
    }

    if (
      !locationData.name ||
      !locationData.country ||
      !locationData.description ||
      !locationData.image ||
      !locationData.coordinates
    ) {
      return toast.error('Please fill all required fields');
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return toast.error('Session expired. Please log in again.');
      }

      const method = selectedLocation ? 'put' : 'post';
      const url = selectedLocation
        ? `${API_BASE_URL}/api/admin/locations/${selectedLocation._id}`
        : `${API_BASE_URL}/api/admin/locations`;

      const response = await axios[method](url, locationData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      toast.success(
        selectedLocation ? 'Location updated successfully' : 'Location added successfully',
      );

      // ✅ Update state locally to prevent unnecessary fetch
      if (selectedLocation) {
        setLocations((prevLocations) =>
          prevLocations.map((loc) => (loc._id === selectedLocation._id ? response.data : loc)),
        );
      } else {
        setLocations((prevLocations) => [...prevLocations, response.data]);
      }

      closeModal();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!user?.isAdmin) {
      toast.error('Access Denied: Only admins can delete locations');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/admin/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const resetForm = () => {
    setLocationData(defaultLocation);
    setSelectedLocation(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Input handler that updates coordinates separately
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setLocationData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: value,
        },
      }));
    } else {
      setLocationData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='flex'>
      <AdminSidebar />
      <div className='flex-1 ml-64 p-8'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Manage Locations</h1>
          {user?.isAdmin && (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <Plus className='h-5 w-5 mr-2' /> Add New Location
            </button>
          )}
        </div>
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg w-96 shadow-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold'>
                  {selectedLocation ? 'Edit Location' : 'Add New Location'}
                </h2>
                <button onClick={closeModal}>
                  <X className='h-5 w-5 text-gray-500' />
                </button>
              </div>
              {/* Standard fields */}
              {['name', 'country', 'image', 'description'].map((field) => (
                <input
                  key={field}
                  type='text'
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(locationData as any)[field] || ''}
                  onChange={handleInputChange}
                  className='w-full mb-3 px-3 py-2 border rounded'
                />
              ))}
              {/* Coordinate fields */}
              <input
                type='text'
                name='lat'
                placeholder='Latitude'
                value={locationData.coordinates.lat}
                onChange={handleInputChange}
                className='w-full mb-3 px-3 py-2 border rounded'
              />
              <input
                type='text'
                name='lng'
                placeholder='Longitude'
                value={locationData.coordinates.lng}
                onChange={handleInputChange}
                className='w-full mb-3 px-3 py-2 border rounded'
              />
              <button
                onClick={handleSubmitLocation}
                className='w-full bg-blue-600 text-white py-2 rounded-lg'
              >
                {selectedLocation ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </div>
        )}

        <div className='mb-6 relative max-w-md'>
          <input
            type='text'
            placeholder='Search locations...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500'
          />
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
        </div>

        {loading ? (
          <p>Loading locations...</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredLocations.map((location) => (
              <div key={location._id} className='bg-white rounded-lg shadow-md overflow-hidden'>
                <img
                  src={location.image}
                  alt={location.name}
                  className='w-full h-48 object-cover'
                />
                <div className='p-4'>
                  <h3 className='text-lg font-semibold'>{location.name}</h3>
                  <p className='text-sm text-gray-600'>{location.country}</p>
                  <p className='text-sm text-gray-500 mt-2'>{location.description}</p>
                  {user?.isAdmin && (
                    <div className='flex space-x-2 mt-3'>
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setLocationData({
                            ...location,
                            coordinates: location.coordinates || { lat: '', lng: '' },
                          });
                          setIsModalOpen(true);
                        }}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-full'
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location._id)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-full'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
