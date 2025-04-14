import { useCallback, useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
interface Transport {
  _id?: string;
  name: string;
  type: TransportType;
  price: number;
  duration: string;
  stopage:string[];
  location: {
    _id: string;
    name?: string | null;
  };
}

export const transportTypes = [
  { value: '0', label: 'not at all' },
  { value: 'bus', label: '🚌 Bus' },
  { value: 'train', label: '🚆 Train' },
  { value: '4wheeler', label: '🚗 4-Wheeler' },
  { value: 'toto', label: '🚖 Toto' },
  { value: 'taxi', label: '🚕 Taxi' },
  { value: 'bike', label: '🏍️ Bike' },
  { value: 'flight', label: '✈️ Flight' },
  { value: 'ship', label: '🚢 Ship' },
  { value: 'boat', label: '🛶 Boat' },
] as const;
interface Location {
  _id: string;
  name: string;
}

interface Hotel {
  _id?: string;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  location: {
    _id: string;
    name?: string | null;
  };
  bestTime: string;
  entryFee: string;
  duration: string;
}
export type TransportType = (typeof transportTypes)[number]['value'];
const defaultSpot: Partial<Transport & Hotel> = {
  location: { _id: '', name: '' },
};

type Tab = 'transport' | 'hotels';
type FormData = Transport | Hotel;

export default function AdminTransport() {
    const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('transport');
  const [data, setData] = useState<Record<Tab, FormData[]>>({
    transport: [],
    hotels: [],
  });
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [spotData, setSpotData] = useState<FormData>(defaultSpot as FormData);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [token, setToken] = useState<string | null>(null);

useEffect(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) setToken(storedToken);
}, []);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');
      const [transport, hotels] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/transport`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/api/admin/hotels`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);
      setData({ transport: transport.data, hotels: hotels.data });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

const fetchLocations = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    const response = await axios.get(`${API_BASE_URL}/api/admin/locations`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    setLocations(response.data);
  } catch (error) {
    console.error('Error fetching locations:', error);
    toast.error('Failed to fetch locations');
  }
}, [API_BASE_URL]);
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!user?.isAdmin) return toast.error('Access denied: Admins only');
   if (!token) return toast.error('User not authenticated');

   const method = formData._id ? 'put' : 'post';
   const url = formData._id
     ? `${API_BASE_URL}/api/admin/${activeTab}/${formData._id}`
     : `${API_BASE_URL}/api/admin/${activeTab}`;

   const request = axios({
     method,
     url,
     data: formData,
     headers: {
       Authorization: `Bearer ${token}`,
       'Content-Type': 'application/json',
     },
     withCredentials: true,
   });

   toast.promise(request, {
     loading: `${formData._id ? 'Updating' : 'Creating'} ${activeTab}...`,
     success: `${formData._id ? 'Updated' : 'Created'} ${activeTab} successfully`,
     error: 'Something went wrong. Please try again.',
   });

   request
     .then(() => {
       fetchData();
       setFormData({} as FormData);
       setIsModalOpen(false);
     })
     .catch((err) => {
       console.error('Submit error:', err);
     });
 };


  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/${activeTab}/${id}`, {
        headers: { Authorization: `Bearer ${token}`,'Content-Type': 'application/json' },
        withCredentials: true,
      });
      toast.success('Deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLocations();
  }, [fetchData, fetchLocations]);

  const renderFormFields = (activeTab: Tab) => {
    if (activeTab === 'transport') {
      const t = formData as Transport;
      return (
        <section className='space-y-3'>
          <input
            value={t.name}
            placeholder='Name'
            onChange={(e) => setFormData({ ...t, name: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <select
            value={t.type}
            onChange={(e) => setFormData({ ...t, type: e.target.value as TransportType })}
            className='w-full px-4 py-2 border rounded-lg'
          >
            <option value='' disabled>
              Select Transport Type
            </option>
            {transportTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={t.price}
            type='number'
            placeholder='Price'
            onChange={(e) => setFormData({ ...t, price: Number(e.target.value) })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={t.duration}
            placeholder='duration'
            onChange={(e) => setFormData({ ...t, duration: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <label className='block font-medium'>Stopages</label>
          {(formData.stopage || []).map((s, index) => (
            <div key={index} className='flex items-center gap-2 mb-2'>
              <input
                type='text'
                value={s}
                onChange={(e) => {
                  const updated = [...formData.stopage!];
                  updated[index] = e.target.value;
                  setFormData({ ...formData, stopage: updated });
                }}
                className='w-full px-4 py-2 border rounded-lg'
                placeholder={`Stopage ${index + 1}`}
              />
              <button
                type='button'
                onClick={() => {
                  const updated = formData.stopage!.filter((_, i) => i !== index);
                  setFormData({ ...formData, stopage: updated });
                }}
                className='px-2 py-1 text-sm bg-red-500 text-white rounded'
              >
                ❌
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => setFormData({ ...formData, stopage: [...(formData.stopage || []), ''] })}
            className='px-3 py-1 bg-blue-500 text-white rounded'
          >
            ➕ Add Stopage
          </button>

          <select
            value={t.location?._id || ''}
            onChange={(e) => {
              const selectedLocation = locations.find((l) => l._id === e.target.value);
              if (selectedLocation) {
                setFormData({ ...t, location: selectedLocation });
              }
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
        </section>
      );
    }

    if (activeTab === 'hotels') {
      const h = formData as Hotel;
      return (
        <section className='space-y-3'>
          <input
            value={h.name}
            placeholder='Name'
            onChange={(e) => setFormData({ ...h, name: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <textarea
            value={h.description}
            placeholder='Description'
            onChange={(e) => setFormData({ ...h, description: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={h.image}
            placeholder='Image URL'
            onChange={(e) => setFormData({ ...h, image: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={h.price}
            placeholder='Price'
            onChange={(e) => setFormData({ ...h, price: e.target.value })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <select
            value={h.location?._id || ''}
            onChange={(e) => {
              const selectedLocation = locations.find((l) => l._id === e.target.value);
              if (selectedLocation) {
                setFormData({ ...h, location: selectedLocation });
              }
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
            value={h.bestTime}
            type='number'
            placeholder=' bestTime'
            onChange={(e) => setFormData({ ...h, rating: Number(e.target.value) })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={h.entryFee}
            placeholder='entryFeee'
            onChange={(e) => setFormData({ ...h, rating: Number(e.target.value) })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={h.duration}
            placeholder='g.map'
            onChange={(e) => setFormData({ ...h, rating: Number(e.target.value) })}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <input
            value={h.rating}
            type='number'
            placeholder='Rating'
            onChange={(e) => setFormData({ ...h, rating: Number(e.target.value) })}
            className='w-full px-4 py-2 border rounded-lg'
          />
        </section>
      );
    }

    return null;
  };

  return (
    <div className='flex m-9 px-4 min-h-screen'>
      <AdminSidebar />
      <main className='flex-1 w-full m-39 flex flex-col items-center  p-2 bg-gray-50'>
        <div className='flex justify-between mb-4'>
          <div className='space-x-2'>
            {(['transport', 'hotels'] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button
            className='bg-green-600 text-white px-4 py-2 rounded-lg font-medium'
            onClick={() => {
              setFormData({} as FormData);
              setIsModalOpen(true);
            }}
          >
            Add {activeTab}
          </button>
        </div>

        {loading ? (
          <p className='text-gray-500'>Loading {activeTab}...</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {data[activeTab].length === 0 ? (
              <p className='text-gray-400'>No {activeTab} entries.</p>
            ) : (
              data[activeTab].map((item: any) => (
                <div key={item._id} className='p-4 bg-white rounded shadow'>
                  <h3 className='font-bold'>{item.name}</h3>
                  <p className='text-sm text-gray-600'>{item.location?.name || ''}</p>
                  <div className='mt-2 flex justify-between'>
                    <button
                      className='text-blue-600 font-medium'
                      onClick={() => {
                        setFormData(item);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className='text-red-600 font-medium'
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold'>
                  {formData._id ? 'Edit' : 'Add'} {activeTab}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='text-gray-500 hover:text-black'
                >
                  <X />
                </button>
              </div>
              <form onSubmit={handleSubmit} className='space-y-4'>
                {renderFormFields(activeTab)}
                <div className='flex justify-end gap-2'>
                  <button
                    type='button'
                    className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg'
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
