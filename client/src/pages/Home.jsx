import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import RestaurantCard from '../components/RestaurantCard';
import ReservationCard from '../components/ReservationCard';
import EventCard from '../components/EventCard';
import { RestaurantCardSkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Healthy', icon: '🥗' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Chinese', icon: '🥡' },
];

// Mock events data
const MOCK_EVENTS = [
  {
    _id: '1',
    name: 'Jazz Night at Blue Moon Bistro',
    category: 'Music Festival',
    location: 'Downtown Theater, Main St',
    date: '2026-05-15',
    time: '7:00 PM',
    price: 45,
    availableSeats: 12,
  },
  {
    _id: '2',
    name: 'International Food Festival 2026',
    category: 'Food Festival',
    location: 'Central Park, City Center',
    date: '2026-05-20',
    time: '6:00 PM',
    price: 35,
    availableSeats: 25,
  },
  {
    _id: '3',
    name: 'Comedy Night Extravaganza',
    category: 'Comedy Night',
    location: 'Laugh Factory, Comedy Lane',
    date: '2026-05-18',
    time: '8:00 PM',
    price: 40,
    availableSeats: 8,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('delivery');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants-featured'],
    queryFn: () => api.get('/restaurants?limit=6')
  });

  return (
    <div className="bg-white">
      {/* Service Tabs - New Feature */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'delivery'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🚚</span> Delivery
            </button>
            <button
              onClick={() => setActiveTab('dineout')}
              className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'dineout'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🍽️</span> Dine-Out
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'events'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🎉</span> Events
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Tab Content */}
      {activeTab === 'delivery' && (
        <>
          {/* Hero Section */}
          <div className="relative bg-orange-50 pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-bold animate-bounce">
                <span>🎉</span> 50% Off your first order
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
                Hungry? We've <br />
                <span className="text-orange-500">Got You Covered.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
                Discover the best food & drinks in your area from over 1,000+ local favorites.
              </p>
              
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-xl">📍</span>
                  <input 
                    type="text" 
                    placeholder="Enter delivery address..." 
                    className="w-full pl-12 pr-4 py-5 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-orange-500 text-lg font-medium"
                    disabled
                  />
                </div>
                <button
                  onClick={() => navigate('/restaurants?near=1')}
                  className="bg-orange-500 text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 text-lg"
                >
                  Find Nearby Food
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 p-8 sm:p-12">
              <h2 className="text-2xl font-black mb-8">What's on your mind?</h2>
              <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.name} 
                    onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(cat.name)}&near=1`)}
                    className="flex flex-col items-center gap-3 group shrink-0 cursor-pointer"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl group-hover:bg-orange-50 group-hover:scale-110 transition-all duration-300">
                      {cat.icon}
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-orange-500">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Restaurants */}
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Featured for You</h2>
                <div className="h-1.5 w-20 bg-orange-500 rounded-full"></div>
              </div>
              <Link to="/restaurants" className="group flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors">
                Explore more <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)
              ) : (
                data?.restaurants?.map(r => <RestaurantCard key={r._id} r={r} />)
              )}
            </div>
          </div>

          {/* Trust Section */}
          <div className="bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'No Minimum Order', icon: '🍱', desc: 'Order just for yourself or the whole office with no restrictions.' },
                { title: 'Live Order Tracking', icon: '🛰️', desc: 'Follow your food in real-time from the restaurant to your door.' },
                { title: 'Lightning Fast Delivery', icon: '⚡', desc: 'Experience the fastest food delivery in the city.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Dine-Out Tab Content */}
      {activeTab === 'dineout' && (
        <>
          {/* Hero Section */}
          <div className="relative bg-teal-50 pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-teal-100 rounded-full text-teal-600 text-sm font-bold animate-bounce">
                <span>✨</span> Premium Dining Experiences
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
                Reserve Your <br />
                <span className="text-teal-500">Perfect Table</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
                Book tables at the finest restaurants in your city for unforgettable dining moments.
              </p>
              
              <button 
                onClick={() => navigate('/dineout')}
                className="inline-flex items-center gap-2 bg-teal-500 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-teal-200 hover:bg-teal-600 transition-all active:scale-95 text-lg"
              >
                Browse Restaurants →
              </button>
            </div>
          </div>

          {/* Featured for Dine-Out */}
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Featured Restaurants</h2>
                <div className="h-1.5 w-20 bg-teal-500 rounded-full"></div>
              </div>
              <Link to="/dineout" className="group flex items-center gap-2 text-teal-500 font-bold hover:text-teal-600 transition-colors">
                See all <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <RestaurantCardSkeleton key={i} />)
              ) : (
                data?.restaurants?.slice(0, 6).map(r => <ReservationCard key={r._id} restaurant={r} />)
              )}
            </div>
          </div>

          {/* Dine-Out Features */}
          <div className="bg-teal-50 py-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Easy Reservations', icon: '📅', desc: 'Book your table instantly with our simple system.' },
                { title: 'Premium Selection', icon: '🍽️', desc: 'Handpicked restaurants with excellent ambiance.' },
                { title: 'Special Occasions', icon: '🎂', desc: 'Perfect for dates, celebrations, and business dinners.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Events Tab Content */}
      {activeTab === 'events' && (
        <>
          {/* Hero Section */}
          <div className="relative bg-purple-50 pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-bold animate-bounce">
                <span>🎪</span> Unforgettable Experiences
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
                Discover Amazing <br />
                <span className="text-purple-500">Events & Entertainment</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
                From concerts and food festivals to workshops and exclusive dinners.
              </p>
              
              <button 
                onClick={() => navigate('/events')}
                className="inline-flex items-center gap-2 bg-purple-500 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-purple-200 hover:bg-purple-600 transition-all active:scale-95 text-lg"
              >
                Explore Events →
              </button>
            </div>
          </div>

          {/* Featured Events */}
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Upcoming Events</h2>
                <div className="h-1.5 w-20 bg-purple-500 rounded-full"></div>
              </div>
              <Link to="/events" className="group flex items-center gap-2 text-purple-500 font-bold hover:text-purple-600 transition-colors">
                See all <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {MOCK_EVENTS.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          </div>

          {/* Events Features */}
          <div className="bg-purple-50 py-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Browse Events', icon: '📅', desc: 'Explore unique dining and entertainment experiences.' },
                { title: 'Instant Booking', icon: '🎟️', desc: 'Book tickets and secure your spot immediately.' },
                { title: 'Unique Experiences', icon: '👨‍🍳', desc: 'From chef-curated dinners to live entertainment.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
