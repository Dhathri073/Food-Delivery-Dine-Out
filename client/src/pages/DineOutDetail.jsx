import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'];
const GUEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function DineOutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [isBooking, setIsBooking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-dineout', id],
    queryFn: () => api.get(`/restaurants/${id}`)
  });

  const handleReserve = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    setIsBooking(true);
    try {
      // In production, this would call a real API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Table reserved for ${guestCount} guests on ${selectedDate} at ${selectedTime}`);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to reserve table');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="text-6xl animate-bounce">🍽️</div>
      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 animate-progress"></div>
      </div>
    </div>
  );

  const restaurant = data?.restaurant;
  if (!restaurant) return (
    <div className="text-center py-32">
      <div className="text-6xl mb-6">🏜️</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Restaurant Not Found</h2>
      <p className="text-gray-500 font-medium">It might have moved or been removed.</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-64 sm:h-96 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-black/60 z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-30 blur-sm">🍽️</div>
        
        <div className="relative z-20 max-w-5xl mx-auto h-full px-4 flex flex-col justify-end pb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {restaurant.cuisine?.map(c => (
              <span key={c} className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/20">
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">{restaurant.name}</h1>
          <div className="flex flex-wrap gap-6 text-white/90 font-bold text-sm">
            <span className="flex items-center gap-2">⭐ {restaurant.rating?.toFixed(1)} <span className="opacity-60">({restaurant.ratingCount}+ Ratings)</span></span>
            <span className="flex items-center gap-2">📍 {restaurant.address}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-30 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8">About this Restaurant</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                Experience fine dining at its best. Our restaurant offers an exquisite menu with carefully curated dishes 
                prepared by award-winning chefs. Perfect for special occasions, celebrations, or a memorable night out.
              </p>

              {/* Ambiance & Features */}
              <h3 className="text-xl font-black text-gray-900 mb-6">Ambiance & Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🎵', label: 'Live Music' },
                  { icon: '🍷', label: 'Wine Selection' },
                  { icon: '👨‍🍳', label: 'Chef\'s Table' },
                  { icon: '🎂', label: 'Special Occasions' },
                  { icon: '🚗', label: 'Valet Parking' },
                  { icon: '♿', label: 'Wheelchair Accessible' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Reviews Preview */}
              <h3 className="text-xl font-black text-gray-900 mb-6">Guest Reviews</h3>
              <div className="space-y-4">
                {[
                  { name: 'Sarah', rating: 5, text: 'Amazing ambiance and delicious food!' },
                  { name: 'John', rating: 5, text: 'Perfect for our anniversary dinner.' },
                  { name: 'Emma', rating: 4, text: 'Great service and excellent cocktails.' },
                ].map((review, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-gray-900">{review.name}</span>
                      <span className="text-sm">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reservation Form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-[32px] shadow-2xl p-8 text-white sticky top-24">
              <h3 className="text-2xl font-black mb-8">Reserve a Table</h3>
              
              <form onSubmit={handleReserve} className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-black mb-3 opacity-90">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/30 bg-white/20 text-white placeholder-white/60 font-bold focus:outline-none focus:border-white transition"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-black mb-3 opacity-90">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/30 bg-white/20 text-white font-bold focus:outline-none focus:border-white transition"
                    required
                  >
                    <option value="" className="bg-teal-600">Select time</option>
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time} className="bg-teal-600">{time}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm font-black mb-3 opacity-90">Number of Guests</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GUEST_COUNTS.map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setGuestCount(count)}
                        className={`py-2 rounded-xl font-black transition ${
                          guestCount === count
                            ? 'bg-white text-teal-600'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Info */}
                <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30">
                  <p className="text-xs opacity-80 font-bold">Your Details</p>
                  <p className="font-black mt-2">{user?.name}</p>
                  <p className="text-sm opacity-80">{user?.phone || 'Add phone in profile'}</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-white text-teal-600 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isBooking ? '🔄 Booking...' : '✓ Confirm Reservation'}
                </button>

                <p className="text-xs text-center opacity-70 font-medium">
                  We'll send a confirmation to your email
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
