import { Link } from 'react-router-dom';

export default function ReservationCard({ restaurant }) {
  const emoji = restaurant.cuisine?.[0] === 'Italian' ? '🍕' : 
                restaurant.cuisine?.[0] === 'Indian' ? '🍛' : 
                restaurant.cuisine?.[0] === 'American' ? '🍔' : 
                restaurant.cuisine?.[0] === 'Chinese' ? '🥡' : '🍽️';

  return (
    <Link to={`/dineout/${restaurant._id}`} className="group">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:-translate-y-2 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="h-full w-full bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
            {emoji}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-1">
              ⭐ {restaurant.rating?.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-xl text-gray-900 group-hover:text-teal-600 transition-colors">{restaurant.name}</h3>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1 mb-4 font-medium">{restaurant.cuisine?.join(' • ')}</p>
          <p className="text-xs text-gray-400 mb-4 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {restaurant.address}
          </p>

          <div className="mt-auto space-y-2">
            <div className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
              ✓ Table Available
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span>🕐</span>
              <span>7 PM - 10 PM Available</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
