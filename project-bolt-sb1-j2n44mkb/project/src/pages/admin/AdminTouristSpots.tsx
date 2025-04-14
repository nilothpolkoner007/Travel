import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface TouristSpot {
  _id: string;
  name: string;
  location: {
    _id: string;
    name?: string | null;
  };
  description: string;
  image: string;
  bestTime: string;
  entryFee: string;
  duration: string;
  coordinates: {
    lat: number | string;
    lng: number | string;
  };
}

interface Location {
  _id: string;
  name: string;
}

const defaultSpot: TouristSpot = {
  _id: '',
  name: '',
  location: { _id: '', name: '' },
  description: '',
  image: '',
  bestTime: '',
  entryFee: '',
  duration: '',
  coordinates: {
    lat: '',
    lng: '',
  },
};

export default function AdminTouristSpots() {
  const { user } = useAuth();
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [spotData, setSpotData] = useState<TouristSpot>(defaultSpot);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchSpots = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const response = await axios.get(`${API_BASE_URL}/api/admin/tourist-spots`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setSpots(response.data);
    } catch (error) {
      console.error('Error fetching tourist spots:', error);
      toast.error('Failed to fetch tourist spots');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

 const fetchLocations = useCallback(async () => {
   try {
     const token = localStorage.getItem('token');
     if (!token) throw new Error('No token');

     const response = await axios.get(`${API_BASE_URL}/api/admin/locations`, {
       headers: { Authorization: `Bearer ${token}` },
       withCredentials: true,
     });

     setLocations(response.data);
   } catch (error) {
     console.error('Error fetching locations:', error);
     toast.error('Failed to fetch locations');
   }
 }, [API_BASE_URL]);

  useEffect(() => {
    fetchSpots();
    fetchLocations();
  }, [fetchSpots, fetchLocations]);

  const handleSubmitSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isAdmin) return toast.error('Access Denied');

    const lat = parseFloat(spotData.coordinates.lat as string);
    const lng = parseFloat(spotData.coordinates.lng as string);

    if (isNaN(lat) || isNaN(lng)) return toast.error('Invalid coordinates');

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const method = selectedSpot ? 'put' : 'post';
      const url = selectedSpot
        ? `${API_BASE_URL}/api/admin/tourist-spots/${selectedSpot._id}`
        : `${API_BASE_URL}/api/admin/tourist-spots`;
        
      const payload = {
        ...spotData,
        location: spotData.location._id, // ✅ Extract only the ID
        coordinates: {
          lat: parseFloat(String(spotData.coordinates.lat)),
          lng: parseFloat(String(spotData.coordinates.lng)),
        },
      };
      // Before sending payload
      if (!selectedSpot) {
        delete (payload as any)._id;
      }

      if (!spotData.location || !spotData.location._id) {
        alert('Please select a valid location.');
        return;
      }
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },

        withCredentials: true,
      });

      toast.success(selectedSpot ? 'Updated successfully' : 'Added successfully');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      selectedSpot
        ? setSpots((prev) => prev.map((s) => (s._id === selectedSpot._id ? response.data : s)))
        : setSpots((prev) => [...prev, response.data]);
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save spot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpot = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      await axios.delete(`${API_BASE_URL}/api/admin/tourist-spots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      toast.success('Deleted successfully');
      setSpots((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'location') {
      const selectedLocation = locations.find((l) => l._id === value);
      setSpotData((prev) => ({
        ...prev,
        location: { _id: value, name: selectedLocation?.name || '' },
      }));
    } else if (name === 'lat' || name === 'lng') {
      setSpotData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: value,
        },
      }));
    } else {
      setSpotData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setSpotData(defaultSpot);
    setSelectedSpot(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const filteredSpots = spots.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='flex'>
      <AdminSidebar />
      <div className='flex-1 ml-64 p-8'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Manage Tourist Spots</h1>
          {user?.isAdmin && (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <Plus className='h-5 w-5 mr-2' /> Add New Spot
            </button>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg w-96'>
              <div className='flex justify-between mb-4'>
                <h2 className='text-xl font-semibold'>
                  {selectedSpot ? 'Edit' : 'Add New'} Tourist Spot
                </h2>
                <button onClick={closeModal}>
                  <X className='h-5 w-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitSpot} className='space-y-4'>
                {['name', 'description', 'image', 'bestTime', 'entryFee', 'duration'].map(
                  (field) => (
                    <input
                      key={field}
                      name={field}
                      value={(spotData as any)[field] || ''}
                      onChange={handleInputChange}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className='w-full px-3 py-2 border rounded'
                    />
                  ),
                )}
                <select
                  name='location'
                  value={spotData.location?._id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedLocation = locations.find((loc) => loc._id === selectedId);
                    setSpotData((prev) => ({
                      ...prev,
                      location: selectedLocation || { _id: '', name: '' },
                    }));
                  }}
                  className='w-full px-3 py-2 border rounded'
                >
                  <option value=''>Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <input
                  name='lat'
                  value={spotData.coordinates.lat}
                  onChange={handleInputChange}
                  placeholder='Latitude'
                  className='w-full px-3 py-2 border rounded'
                />
                <input
                  name='lng'
                  value={spotData.coordinates.lng}
                  onChange={handleInputChange}
                  placeholder='Longitude'
                  className='w-full px-3 py-2 border rounded'
                />
                <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-2 rounded-lg'
                  disabled={isSubmitting}
                >
                  {selectedSpot ? 'Update' : 'Add'} Spot
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <div className='mb-6 relative max-w-md'>
          <input
            type='text'
            placeholder='Search spots...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 pl-10 border rounded-lg'
          />
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
        </div>

        {/* Cards */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredSpots.map((spot) => (
              <div key={spot._id} className='bg-white rounded-lg shadow-md overflow-hidden'>
                <img src={spot.image} alt={spot.name} className='w-full h-48 object-cover' />
                <div className='p-4'>
                  <h3 className='text-lg font-semibold'>{spot.name}</h3>
                  <p className='text-sm text-gray-600'>{spot.location?.name || 'Unknown'}</p>
                  <p className='text-sm text-gray-500 mt-2'>{spot.description}</p>
                  {user?.isAdmin && (
                    <div className='flex space-x-2 mt-3'>
                      <button
                        onClick={() => {
                          setSelectedSpot(spot);
                          setSpotData(spot);
                          setIsModalOpen(true);
                        }}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-full'
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleDeleteSpot(spot._id)}
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
