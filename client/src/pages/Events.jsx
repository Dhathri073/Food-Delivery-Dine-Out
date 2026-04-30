import { useState } from 'react';
import EventCard from '../components/EventCard';

// Mock events data - in production this would come from an API
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
    description: 'Enjoy live jazz music with elegant dining'
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
    description: 'Taste cuisines from around the world'
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
    description: 'Laugh with top comedians while enjoying dinner'
  },
  {
    _id: '4',
    name: 'Culinary Workshop: Pasta Making',
    category: 'Workshop',
    location: 'Chef Academy, Kitchen District',
    date: '2026-05-22',
    time: '2:00 PM',
    price: 60,
    availableSeats: 15,
    description: 'Learn authentic Italian pasta making from a master chef'
  },
  {
    _id: '5',
    name: 'Wine Tasting Evening',
    category: 'Workshop',
    location: 'Vineyard Restaurant, Wine Row',
    date: '2026-05-25',
    time: '6:30 PM',
    price: 75,
    availableSeats: 20,
    description: 'Premium wine tasting with gourmet appetizers'
  },
  {
    _id: '6',
    name: 'Networking Dinner for Entrepreneurs',
    category: 'Networking',
    location: 'Luxury Hotel, Business Plaza',
    date: '2026-05-28',
    time: '7:00 PM',
    price: 50,
    availableSeats: 30,
    description: 'Connect with like-minded professionals over dinner'
  },
];

export default function Events() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(MOCK_EVENTS.map(e => e.category))];
  const filteredEvents = activeCategory === 'All'
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter(e => e.category === activeCategory);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">Events</h1>
          <p className="text-lg text-gray-600 font-medium">Discover amazing dining and entertainment experiences</p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-[40px] shadow-lg p-8 sm:p-10 mb-12 border border-gray-100">
          <h2 className="text-xl font-black mb-6">Event Type</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div>
          <h2 className="text-2xl font-black mb-8 text-gray-900">
            {activeCategory === 'All' ? 'All Events' : `${activeCategory} Events`}
          </h2>
          
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredEvents.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 font-medium">Check back soon for more events</p>
            </div>
          )}
        </div>

        {/* Upcoming Events Info */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📅', title: 'Browse Events', desc: 'Explore upcoming dining and entertainment events in your city' },
            { icon: '🎟️', title: 'Reserve Your Spot', desc: 'Book tickets and secure your seat at exclusive experiences' },
            { icon: '👨‍🍳', title: 'Unique Experiences', desc: 'From chef-curated dinners to live entertainment and workshops' },
          ].map((item, i) => (
            <div key={i} className="bg-purple-50 rounded-3xl p-8 text-center border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-black text-lg mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
