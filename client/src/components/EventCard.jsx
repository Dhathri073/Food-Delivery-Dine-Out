import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const eventEmoji = {
    'Music Festival': '🎵',
    'Food Festival': '🍜',
    'Comedy Night': '😂',
    'Workshop': '🎓',
    'Sports': '⚽',
    'Art Exhibition': '🎨',
    'Networking': '🤝',
  };

  const emoji = eventEmoji[event.category] || '🎪';

  return (
    <Link to={`/events/${event._id}`} className="group">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:-translate-y-2 h-full flex flex-col">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="h-full w-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
            {emoji}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-sm font-bold shadow-sm">
              {event.availableSeats} seats
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-black text-xl text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
            {event.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1 mb-4 font-medium">{event.category}</p>
          
          {/* Location */}
          <p className="text-xs text-gray-400 mb-3 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {event.location}
          </p>

          {/* Date & Time */}
          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <span>📅</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <span>🕐</span>
              <span>{event.time}</span>
            </div>
            
            {/* Price & Button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-lg font-black text-purple-600">${event.price}</span>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">Book Now →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
