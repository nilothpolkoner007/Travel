export interface Location {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  image: string;
  bestTime: string;
  entryFee: string;
  locationId: string;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  locationId: string;
  bookingLink: string;
}

export interface Transport {
  type: 'flight' | 'train' | 'taxi' | 'rental';
  name: string;
  price: string;
  duration: string;
  locationId: string;
}