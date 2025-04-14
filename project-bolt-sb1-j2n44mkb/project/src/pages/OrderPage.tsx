import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, CreditCard } from 'lucide-react';

interface OrderFormData {
  date: string;
  time: string;
  numberOfPeople: number;
  paymentMethod: 'credit_card' | 'paypal';
}

export default function OrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OrderFormData>({
    date: '',
    time: '',
    numberOfPeople: 1,
    paymentMethod: 'credit_card'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/orders', formData, {
        withCredentials: true
      });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of People
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfPeople}
              onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900">Credit Card</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: 'paypal' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900">PayPal</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Booking
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="text-gray-900">{formData.date || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time</span>
            <span className="text-gray-900">{formData.time || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Number of People</span>
            <span className="text-gray-900">{formData.numberOfPeople}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="text-gray-900">
              {formData.paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}