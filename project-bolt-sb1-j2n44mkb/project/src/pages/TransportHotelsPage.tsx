import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plane,
  Train,
  Car,
  Star,
  ExternalLink,
  MapPin,
  Ship,
  Bike,
  BusFront,
 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api'; // replace this

interface Transport {
  id: string;
  name: string;
  type: string;
  image: string;
  price: string;
  rating: number;
  description: string;
  stopage: string[];
}

interface Hotel {
  _id: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  description: string;
  location: string;
  bestTime: string;
  entryFee: string;
  duration: string;
}

const transportTypes = [
  { label: 'Flight', value: 'flight' },
  { label: 'Train', value: 'train' },
  { label: '4-Wheeler', value: '4wheeler' },
  { label: 'Bus', value: 'bus' },
  { label: 'Taxi', value: 'taxi' },
  { label: 'Toto', value: 'toto' },
  { label: 'Bike', value: 'bike' },
  { label: 'Ship', value: 'ship' },
  { label: 'Boat', value: 'boat' },
];

function getIcon(type: string) {
  switch (type) {
    case 'flight':
      return Plane;
    case 'train':
      return Train;
    case '4wheeler':
    case 'taxi':
    case 'toto':
      return Car;
    case 'bike':
      return Bike;
    case 'bus':
      return BusFront;
    case 'ship':
      return Ship;
    case 'boat':
      return Boat;
    default:
      return Car;
  }
}

export default function TransportHotelsPage() {
  const [selectedTab, setSelectedTab] = useState<'transport' | 'hotels'>('transport');
  const [transportData, setTransportData] = useState<Transport[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);


  useEffect(() => {
    const fetchTransportData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/transport`);
        setTransportData(res.data);
      } catch (err) {
        console.error('Failed to fetch transport data:', err);
      }
    };

    const fetchHotelData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/hotel`);
        setHotels(res.data);
      } catch (err) {
        console.error('Failed to fetch hotel data:', err);
      }
    };

    fetchTransportData();
    fetchHotelData();
  }, []);

  const allStopages = Array.from(new Set(transportData.flatMap((t) => t.stopage)));

  const filteredTransport = transportData.filter(
    (t) =>
      (!selectedType || t.type === selectedType) &&
      (!from || t.stopage.includes(from)) &&
      (!to || t.stopage.includes(to)),
  );

  const filteredHotels = hotels.filter((h) =>
    h.location?.toLowerCase().includes(searchLocation.toLowerCase()),
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='flex space-x-4 mb-8'>
        <button
          onClick={() => setSelectedTab('transport')}
          className={`px-6 py-3 rounded-lg font-medium ${
            selectedTab === 'transport'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Transport Options
        </button>
        <button
          onClick={() => setSelectedTab('hotels')}
          className={`px-6 py-3 rounded-lg font-medium ${
            selectedTab === 'hotels'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hotels & Stays
        </button>
      </div>

      {selectedTab === 'transport' && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='relative'>
              <input
                type='text'
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setFromSuggestions(
                    allStopages.filter((s) =>
                      s.toLowerCase().includes(e.target.value.toLowerCase()),
                    ),
                  );
                }}
                placeholder='From'
                className='w-full px-4 py-2 border rounded-lg'
              />
              {from && fromSuggestions.length > 0 && (
                <ul className='absolute z-10 bg-white border mt-1 w-full rounded-lg shadow-md max-h-48 overflow-y-auto'>
                  {fromSuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setFrom(s);
                        setFromSuggestions([]);
                      }}
                      className='px-4 py-2 hover:bg-blue-100 cursor-pointer'
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='relative'>
              <input
                type='text'
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setToSuggestions(
                    allStopages.filter((s) =>
                      s.toLowerCase().includes(e.target.value.toLowerCase()),
                    ),
                  );
                }}
                placeholder='To'
                className='w-full px-4 py-2 border rounded-lg'
              />
              {to && toSuggestions.length > 0 && (
                <ul className='absolute z-10 bg-white border mt-1 w-full rounded-lg shadow-md max-h-48 overflow-y-auto'>
                  {toSuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setTo(s);
                        setToSuggestions([]);
                      }}
                      className='px-4 py-2 hover:bg-blue-100 cursor-pointer'
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              value={selectedType ?? ''}
              onChange={(e) => setSelectedType(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
            >
              <option value=''>All Transport Types</option>
              {transportTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {filteredTransport.map((t, i) => {
              const Icon = getIcon(t.type);
              return (
                <div key={i} className='bg-white rounded-xl shadow-lg overflow-hidden'>
                  <img src={t.image} alt={t.name} className='w-full h-64 object-cover' />
                  <div className='p-6'>
                    <div className='flex justify-between items-start mb-4'>
                      <h3 className='text-xl font-semibold'>{t.name}</h3>
                      <div className='flex items-center'>
                        <Icon className='h-6 w-6 text-blue-500 mr-2' />
                        <Star className='h-5 w-5 text-yellow-400 fill-current' />
                        <span className='ml-1 font-medium'>{t.rating}</span>
                      </div>
                    </div>
                    <p className='text-gray-600 mb-2'>{t.description}</p>
                    <p className='text-gray-600 mb-2'>Price: ₹{t.price}</p>
                    <p className='text-gray-600 mb-2'>Stopages: {t.stopage.join(', ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedTab === 'hotels' && (
        <>
          <div className='mb-6 flex items-center gap-2'>
            <MapPin className='h-5 w-5 text-gray-500' />
            <select
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
            >
              <option value=''>All Locations</option>
              {hotels.map((hotel) => (
                <option key={hotel._id} value={hotel.location?.name}>
                  {hotel.location?.name}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {filteredHotels.map((hotel) => (
              <div key={hotel._id} className='bg-white rounded-xl shadow-lg overflow-hidden'>
                <img src={hotel.image} alt={hotel.name} className='w-full h-64 object-cover' />
                <div className='p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <h3 className='text-2xl font-semibold'>{hotel.name}</h3>
                    <div className='flex items-center'>
                      <Star className='h-5 w-5 text-yellow-400 fill-current' />
                      <span className='ml-1 font-medium'>{hotel.rating}</span>
                    </div>
                  </div>
                  <p className='text-gray-600 mb-4'>{hotel.description}</p>
                  <div className='text-sm text-gray-500 mb-2'>Location: {hotel.location?.name}</div>

                  {/* New section for bestTime, entryFee, duration */}
                  <div className='grid grid-cols-1 sm:grid-cols-3 text-sm text-gray-700 gap-4 mb-4'>
                    <div>
                      <strong>Best Time:</strong> {hotel.bestTime}
                    </div>
                    <div>
                      <strong>Entry Fee:</strong> ₹{hotel.entryFee}
                    </div>
                    <div>
                      <strong>Duration:</strong> {hotel.duration}
                    </div>
                  </div>

                  <div className='flex justify-between items-center mt-4'>
                    <span className='text-xl font-bold text-gray-900'>₹{hotel.price}/night</span>
                    <button className='flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                      Book Now
                      <ExternalLink className='h-4 w-4 ml-2' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
