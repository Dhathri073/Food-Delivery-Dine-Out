import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Mock event data
const MOCK_EVENTS = {
  '1': {
    name: 'Jazz Night at Blue Moon Bistro',
    category: 'Music Festival',
    location: 'Downtown Theater, Main St',
    date: '2026-05-15',
    time: '7:00 PM',
    price: 45,
    availableSeats: 12,
    duration: '3 hours',
    description: 'Enjoy live jazz music with elegant dining. Our renowned jazz quartet will perform throughout the evening while you savor our specially curated dinner menu.',
    highlights: [
      'Live jazz performance',
      '3-course dinner',
      'Complimentary welcome drink',
      'Premium seating',
    ],
    image: '🎵',
  },
  '2': {
    name: 'International Food Festival 2026',
    category: 'Food Festival',
    location: 'Central Park, City Center',
    date: '2026-05-20',
    time: '6:00 PM',
    price: 35,
    availableSeats: 25,
    duration: '4 hours',
    description: 'Taste cuisines from around the world. Experience authentic dishes from over 20 different countries all in one place.',
    highlights: [
      'Cuisines from 20+ countries',
      'Live cooking demonstrations',
      'Expert chef talks',
      'Wine pairings',
    ],
    image: '🍜',
  },
  '3': {
    name: 'Comedy Night Extravaganza',
    category: 'Comedy Night',
    location: 'Laugh Factory, Comedy Lane',
    date: '2026-05-18',
    time: '8:00 PM',
    price: 40,
    availableSeats: 8,
    duration: '2.5 hours',
    description: 'Laugh with top comedians while enjoying dinner. Premium comedy shows from nationally recognized performers.',
    highlights: [
      '3 featured comedians',
      'Dinner included',
      'Full bar available',
      'Reserved seating',
    ],
    image: '😂',
  },
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const event = MOCK_EVENTS[id];

  if (!event) {
    return (
      <div className="text-center py-32">
        <div className="text-6xl mb-6">🎪</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Event Not Found</h2>
        <p className="text-gray-500 font-medium">The event you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleBook = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Booked ${selectedTickets} ticket(s) for ${event.name}`);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      toast.error('Failed to book tickets');
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = event.price * selectedTickets;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-30 blur-lg">
          {event.image}
        </div>
        
        <div className="relative z-20 max-w-5xl mx-auto h-full px-4 flex flex-col justify-end pb-12">
          <div className="inline-flex w-fit px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-4">
            <span className="text-white text-sm font-black uppercase tracking-widest">{event.category}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">{event.name}</h1>
          <div className="flex flex-wrap gap-8 text-white/90 font-bold text-sm">
            <span className="flex items-center gap-2">📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-2">🕐 {event.time}</span>
            <span className="flex items-center gap-2">⏱️ {event.duration}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-30 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100 mb-8">
              {/* Description */}
              <h2 className="text-2xl font-black text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                {event.description}
              </p>

              {/* Highlights */}
              <h3 className="text-xl font-black text-gray-900 mb-6">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {event.highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <span className="text-2xl">✓</span>
                    <span className="font-bold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Location Details */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-4">Location</h3>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📍</span>
                  <div>
                    <p className="font-bold text-gray-900">{event.location}</p>
                    <p className="text-sm text-gray-600 mt-2">Parking available • Public transportation accessible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Guest Reviews</h3>
              <div className="space-y-4">
                {[
                  { name: 'Alex M.', rating: 5, text: 'Incredible experience! The performers were amazing.' },
                  { name: 'Jordan T.', rating: 5, text: 'Best event I\'ve attended. Highly recommended!' },
                  { name: 'Casey L.', rating: 5, text: 'Worth every penny. Great atmosphere and entertainment.' },
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

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[32px] shadow-2xl p-8 text-white sticky top-24">
              <h3 className="text-2xl font-black mb-8">Book Your Tickets</h3>

              {/* Price Display */}
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 border border-white/30">
                <p className="text-xs opacity-80 font-bold mb-2">TICKET PRICE</p>
                <div className="text-3xl font-black">${event.price}</div>
                <p className="text-xs opacity-60 mt-1">per ticket</p>
              </div>

              <form onSubmit={handleBook} className="space-y-6">
                {/* Ticket Count */}
                <div>
                  <label className="block text-sm font-black mb-3 opacity-90">Number of Tickets</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedTickets(num)}
                        disabled={num > event.availableSeats}
                        className={`py-3 rounded-xl font-black text-sm transition ${
                          selectedTickets === num
                            ? 'bg-white text-purple-600'
                            : num > event.availableSeats
                            ? 'bg-white/10 opacity-50 cursor-not-allowed'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seats Available */}
                <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30">
                  <p className="text-xs opacity-80 font-bold mb-1">SEATS AVAILABLE</p>
                  <p className="font-black text-lg">{event.availableSeats} seats</p>
                </div>

                {/* Total Price */}
                <div className="border-t border-white/30 pt-6">
                  <p className="text-xs opacity-80 font-bold mb-2">TOTAL PRICE</p>
                  <p className="text-4xl font-black">${totalPrice}</p>
                </div>

                {/* User Info */}
                {user && (
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30">
                    <p className="text-xs opacity-80 font-bold">BOOKING FOR</p>
                    <p className="font-black mt-2">{user.name}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isBooking || selectedTickets > event.availableSeats}
                  className="w-full bg-white text-purple-600 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isBooking ? '🔄 Booking...' : '✓ Book Now'}
                </button>

                <p className="text-xs text-center opacity-70 font-medium">
                  You'll receive confirmation instantly
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
